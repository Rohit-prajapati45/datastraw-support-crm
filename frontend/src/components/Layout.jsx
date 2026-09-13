import { Link, NavLink } from 'react-router-dom';

export default function Layout({ children }) {
  return <><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><Link to="/" className="text-lg font-bold tracking-tight text-ink">Support<span className="text-cyan-700">Desk</span></Link><nav className="flex gap-1"><NavLink to="/" end className={({isActive}) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-cyan-50 text-cyan-800' : 'text-slate-600 hover:text-slate-900'}`}>Tickets</NavLink><NavLink to="/tickets/new" className={({isActive}) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-cyan-50 text-cyan-800' : 'text-slate-600 hover:text-slate-900'}`}>Create ticket</NavLink></nav></div></header><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main></>;
}
