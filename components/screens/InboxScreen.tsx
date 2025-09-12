import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import type { Entry } from '../../types';
import { MessageSquare, ChevronRight, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';

const InboxScreen: React.FC = () => {
  const { entries, userRole, user, pair } = useData();
  const navigate = useNavigate();

  if (!user || !userRole || !pair) return null;

  const partnerRole = userRole === 'A' ? 'B' : 'A';
  const partnerId = pair.userIds.find(id => id !== user.id);

  const inboxEntries = entries.filter(entry => 
    entry.status === 'waiting_partner_audio' && entry.createdBy !== user.id
  );

  const getPartnerName = () => {
    // This is a simplification. In a real app, you'd fetch the partner's profile.
    return "Your Partner";
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-text-main">Inbox</h2>
      {inboxEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 mt-16 bg-base-200 rounded-lg shadow">
          <MessageSquare size={48} className="text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text-main">All caught up!</h3>
          <p className="text-text-muted mb-6">Your inbox is empty. Why not add a new word for your partner?</p>
          <div className="w-full max-w-xs">
            <Button onClick={() => navigate('/add')} variant="secondary">
              <span className="flex items-center justify-center">
                <PlusCircle size={16} className="mr-2"/>
                Add New Word
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="bg-base-200 rounded-lg shadow overflow-hidden">
          {inboxEntries.map((entry: Entry) => (
            <li key={entry.id} className="border-b border-base-300 last:border-b-0">
              <button
                onClick={() => navigate(`/inbox/complete/${entry.id}`)}
                className="w-full flex items-center justify-between p-4 hover:bg-base-300 transition-colors text-left"
              >
                <div>
                  <p className="font-semibold text-lg text-text-main">{entry.text_pivot}</p>
                  <p className="text-sm text-text-muted">Added by {getPartnerName()}</p>
                </div>
                <ChevronRight size={20} className="text-text-muted" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InboxScreen;