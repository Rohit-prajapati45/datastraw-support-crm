import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetails from './pages/TicketDetails.jsx';

export default function App() { return <Layout><Routes><Route path="/" element={<Dashboard />} /><Route path="/tickets/new" element={<CreateTicket />} /><Route path="/tickets/:ticketId" element={<TicketDetails />} /></Routes></Layout>; }
