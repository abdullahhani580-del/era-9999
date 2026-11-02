import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export type SupportType = 'inquiry' | 'suggestion' | 'issue';

export interface SupportTicket {
  id?: string;
  senderName: string;
  senderEmail: string;
  type: SupportType;
  subject?: string;
  message: string;
  createdAt: string;
  userId?: string;
  status?: 'new' | 'reviewed' | 'resolved';
  adminReply?: string;
  repliedAt?: string;
}

/**
 * Creates a unique safe ID for Firestore documents
 */
function generateTicketId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ticket_${timestamp}_${random}`;
}

/**
 * Sends a friendly direct message to the developer (stored safely in Firestore)
 */
export async function sendUserSupportMessage(
  message: string,
  type: SupportType = 'suggestion',
  user?: { displayName?: string | null; email?: string | null; uid?: string } | null
): Promise<{ success: boolean; error?: string }> {
  if (!user || !user.uid) {
    return { success: false, error: 'auth_required' };
  }

  if (!message.trim()) {
    return { success: false, error: 'empty' };
  }

  const ticketId = generateTicketId();
  const ticketDoc = doc(db, 'support_tickets', ticketId);

  const payload: SupportTicket = {
    id: ticketId,
    senderName: user.displayName || 'مستخدم مسجل',
    senderEmail: user.email || 'مسجل بحساب Google',
    type,
    subject: type === 'suggestion' ? 'اقتراح' : type === 'inquiry' ? 'استفسار' : 'مشكلة',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'new',
    userId: user.uid,
  };

  try {
    await setDoc(ticketDoc, payload);
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'support_tickets');
    return { success: false, error: 'failed' };
  }
}

/**
 * Fetch all support tickets (admin only)
 */
export async function fetchAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const colRef = collection(db, 'support_tickets');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const tickets: SupportTicket[] = [];
    snap.forEach((d) => {
      tickets.push({ id: d.id, ...(d.data() as Omit<SupportTicket, 'id'>) });
    });
    return tickets;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'support_tickets');
    return [];
  }
}

/**
 * Live subscription to support tickets for the developer dashboard
 */
export function subscribeToSupportTickets(
  onData: (tickets: SupportTicket[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, 'support_tickets');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snap) => {
      const tickets: SupportTicket[] = [];
      snap.forEach((d) => {
        tickets.push({ id: d.id, ...(d.data() as Omit<SupportTicket, 'id'>) });
      });
      onData(tickets);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'support_tickets');
      }
    }
  );
}

/**
 * Delete a ticket (admin only)
 */
export async function deleteSupportTicket(ticketId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'support_tickets', ticketId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'support_tickets');
    return false;
  }
}

/**
 * Send an in-app reply to a ticket (admin only)
 */
export async function replyToSupportTicket(
  ticketId: string,
  replyMessage: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(docRef, {
      adminReply: replyMessage.trim(),
      repliedAt: new Date().toISOString(),
      status: 'resolved',
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `support_tickets/${ticketId}`);
    return false;
  }
}

/**
 * Live subscription to a user's own tickets to see developer replies in real time
 */
export function subscribeToUserTickets(
  userId: string,
  onData: (tickets: SupportTicket[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, 'support_tickets');
  const q = query(colRef, where('userId', '==', userId), limit(20));

  return onSnapshot(
    q,
    (snap) => {
      const tickets: SupportTicket[] = [];
      snap.forEach((d) => {
        tickets.push({ id: d.id, ...(d.data() as Omit<SupportTicket, 'id'>) });
      });
      // Sort newest first
      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(tickets);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        console.warn('User tickets subscription error:', error);
      }
    }
  );
}

