import { Router } from 'express';
import db, { transaction } from '../database/db.js';
import { createTicketSummary } from '../services/aiService.js';

const router = Router();
const STATUSES = ['Open', 'In Progress', 'Closed'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const now = () => new Date().toISOString();
const clean = (value) => typeof value === 'string' ? value.trim() : '';

function getTicket(ticketId) {
  return db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticketId);
}

router.post('/', (req, res, next) => {
  try {
    const customer_name = clean(req.body.customer_name);
    const customer_email = clean(req.body.customer_email);
    const subject = clean(req.body.subject);
    const description = clean(req.body.description);
    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'Customer name, email, subject, and description are required.' });
    }
    if (!emailPattern.test(customer_email)) return res.status(400).json({ error: 'Enter a valid customer email address.' });

    const created_at = now();
    const insert = () => transaction(() => {
      const nextNumber = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS nextNumber FROM tickets').get().nextNumber;
      const ticket_id = `TKT-${String(nextNumber).padStart(3, '0')}`;
      db.prepare(`INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`)
        .run(ticket_id, customer_name, customer_email, subject, description, created_at, created_at);
      return ticket_id;
    });
    const ticket_id = insert();
    return res.status(201).json({ ticket_id, created_at });
  } catch (error) { next(error); }
});

router.get('/', (req, res, next) => {
  try {
    const search = clean(req.query.search);
    const status = clean(req.query.status);
    if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status filter.' });
    const clauses = [];
    const params = [];
    if (search) {
      const value = `%${search}%`;
      clauses.push('(customer_name LIKE ? COLLATE NOCASE OR ticket_id LIKE ? COLLATE NOCASE OR customer_email LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE)');
      params.push(value, value, value, value);
    }
    if (status) { clauses.push('status = ?'); params.push(status); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const tickets = db.prepare(`SELECT ticket_id, customer_name, customer_email, subject, status, created_at, updated_at FROM tickets ${where} ORDER BY created_at DESC`).all(...params);
    res.json(tickets);
  } catch (error) { next(error); }
});

router.get('/:ticket_id', (req, res, next) => {
  try {
    const ticket = getTicket(req.params.ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    const notes = db.prepare('SELECT id, ticket_id, note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at ASC').all(ticket.ticket_id);
    return res.json({ ...ticket, notes });
  } catch (error) { next(error); }
});

router.put('/:ticket_id', (req, res, next) => {
  try {
    const ticket = getTicket(req.params.ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    const status = req.body.status === undefined ? undefined : clean(req.body.status);
    const notes = req.body.notes === undefined ? '' : clean(req.body.notes);
    if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status value.' });
    if (status === undefined && !notes) return res.status(400).json({ error: 'Provide a status change or a note.' });
    const updated_at = now();
    const save = () => transaction(() => {
      if (status !== undefined) db.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?').run(status, updated_at, ticket.ticket_id);
      else db.prepare('UPDATE tickets SET updated_at = ? WHERE ticket_id = ?').run(updated_at, ticket.ticket_id);
      if (notes) db.prepare('INSERT INTO notes (ticket_id, note_text, created_at) VALUES (?, ?, ?)').run(ticket.ticket_id, notes, updated_at);
    });
    save();
    return res.json({ success: true, updated_at });
  } catch (error) { next(error); }
});

router.post('/:ticket_id/summary', async (req, res, next) => {
  try {
    const ticket = getTicket(req.params.ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    const summary = await createTicketSummary(ticket);
    return res.json({ summary });
  } catch (error) { next(error); }
});

export default router;
