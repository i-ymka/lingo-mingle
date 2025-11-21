import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getUser } from '../../services/firebaseApi';
import type { Entry } from '../../types';
import { MessageSquare, ChevronRight, PlusCircle, Users } from 'lucide-react';
import Button from '../ui/Button';

const InboxScreen: React.FC = () => {
  const { entries, userRole, user, pair } = useData();
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState<string>('Your Partner');

  if (!user || !userRole || !pair) return null;

  const partnerRole = userRole === 'A' ? 'B' : 'A';
  const partnerId = pair.userIds.find(id => id !== user.id);

  const inboxEntries = entries.filter(entry =>
    entry.status === 'waiting_partner_audio' && entry.createdBy !== user.id
  );

  // Load partner's name
  useEffect(() => {
    const loadPartnerName = async () => {
      if (!partnerId) {
        setPartnerName('Waiting for Partner');
        return;
      }

      try {
        const partner = await getUser(partnerId);
        if (partner) {
          setPartnerName(partner.displayName);
        }
      } catch (error) {
        console.error('Failed to load partner name:', error);
      }
    };

    loadPartnerName();
  }, [partnerId]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Inbox
      </h2>
      {inboxEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-10 mt-16 glass-card rounded-3xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center glow-primary mb-6">
            <MessageSquare size={40} className="text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">All caught up!</h3>
          <p className="text-text-secondary mb-8">Your inbox is empty. Why not add a new word for your partner?</p>
          <div className="w-full max-w-xs">
            <Button onClick={() => navigate('/add')} variant="primary">
              <PlusCircle size={20} className="mr-2"/>
              Add New Word
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxEntries.map((entry: Entry) => (
            <button
              key={entry.id}
              onClick={() => navigate(`/inbox/complete/${entry.id}`)}
              className="w-full glass-card rounded-2xl p-5 hover:glow-primary transition-all duration-base ease-ios active:scale-98 text-left"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="font-bold text-xl text-text-main mb-1">{entry.text_pivot}</p>
                  <p className="text-sm text-text-secondary flex items-center gap-1">
                    <Users size={14} />
                    Added by {partnerName}
                  </p>
                </div>
                <ChevronRight size={24} className="text-text-muted" strokeWidth={2} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxScreen;