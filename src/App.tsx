import { useState, useEffect, FormEvent } from 'react';
import { 
  Award, Mail, Phone, MapPin, Sparkles, Lock, 
  UserPlus, CheckCircle, ShieldAlert, KeyRound, EyeOff, Globe,
  Facebook, Linkedin, Youtube, Instagram, MessageCircle
} from 'lucide-react';

import { User, InternshipApplication, Notification, AdminLog, StripeSubscription } from './types';
import { initializeDatabase } from './mockData';

// Firebase Imports
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Component Imports
import Navbar from './components/Navbar';
import CompanyLogosTrain from './components/CompanyLogosTrain';
import LandingHero from './components/LandingHero';
import ApplicationForm from './components/ApplicationForm';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Toast, { ToastMessage } from './components/Toast';

export default function App() {
  // Sync core state from Firebase with LocalStorage support/backups on initialization
  useEffect(() => {
    initializeDatabase();
    syncFirebaseData();
  }, []);

  // System Core States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Navigation state: 'landing', 'apply', 'dashboard', 'admin'
  const [currentView, setCurrentView] = useState<string>('landing');

  // Auth Dialog state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRoleSelection, setAuthRoleSelection] = useState<'student' | 'admin'>('student');
  const [authError, setAuthError] = useState('');

  // Toast notifier state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Load from LocalStorage Backup Helper
  const loadLocalStorageData = () => {
    const rawUsers = localStorage.getItem('exposys_users');
    const rawApps = localStorage.getItem('exposys_applications');
    const rawNotif = localStorage.getItem('exposys_notifications');
    const rawLogs = localStorage.getItem('exposys_logs');

    if (rawUsers) setUsers(JSON.parse(rawUsers));
    if (rawApps) setApplications(JSON.parse(rawApps));
    if (rawNotif) setNotifications(JSON.parse(rawNotif));
    if (rawLogs) setLogs(JSON.parse(rawLogs));
  };

  // Sync / Auto-bootstrap Firestore DB and local variables
  const syncFirebaseData = async () => {
    try {
      // 1. Fetch Users
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      let usersList: User[] = [];
      userSnapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as User);
      });

      // 2. Fetch Applications
      const appsCol = collection(db, 'applications');
      const appsSnapshot = await getDocs(appsCol);
      let appsList: InternshipApplication[] = [];
      appsSnapshot.forEach((docSnap) => {
        appsList.push(docSnap.data() as InternshipApplication);
      });

      // 3. Fetch Notifications
      const notifCol = collection(db, 'notifications');
      const notifSnapshot = await getDocs(notifCol);
      let notificationsList: Notification[] = [];
      notifSnapshot.forEach((docSnap) => {
        notificationsList.push(docSnap.data() as Notification);
      });

      // 4. Fetch Logs
      const logsCol = collection(db, 'logs');
      const logsSnapshot = await getDocs(logsCol);
      let logsList: AdminLog[] = [];
      logsSnapshot.forEach((docSnap) => {
        logsList.push(docSnap.data() as AdminLog);
      });

      // If Firestore database is completely empty/clean, we bootstrap it!
      if (usersList.length === 0) {
        const { INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_NOTIFICATIONS } = await import('./mockData');
        
        for (const u of INITIAL_USERS) {
          await setDoc(doc(db, 'users', u.id), u);
        }
        for (const app of INITIAL_APPLICATIONS) {
          await setDoc(doc(db, 'applications', app.id), app);
        }
        for (const n of INITIAL_NOTIFICATIONS) {
          await setDoc(doc(db, 'notifications', n.id), n);
        }
        
        // Initial Admin Action Log
        const initialLog: AdminLog = {
          id: 'log_1',
          adminId: 'user_admin_1',
          action: 'APPROVED_APPLICATION',
          targetUser: 'Rahul Sharma (Data Science)',
          createdAt: '2026-05-18T10:00:00Z'
        };
        await setDoc(doc(db, 'logs', 'log_1'), initialLog);
        
        // Refetch initialized contents securely
        await syncFirebaseData();
        return;
      }

      setUsers(usersList);
      setApplications(appsList);
      setNotifications(notificationsList);
      setLogs(logsList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Backup local cache values
      localStorage.setItem('exposys_users', JSON.stringify(usersList));
      localStorage.setItem('exposys_applications', JSON.stringify(appsList));
      localStorage.setItem('exposys_notifications', JSON.stringify(notificationsList));
      localStorage.setItem('exposys_logs', JSON.stringify(logsList));

    } catch (error) {
      console.warn('Firebase sync offline or permissions issue; falling back to high-durability cache storage.', error);
      loadLocalStorageData();
    }
  };

  // Google Authentication Trigger
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      if (!fbUser) return;

      // Search matching record in firestore 'users'
      let foundUser = users.find(u => u.id === fbUser.uid || u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
      
      if (foundUser) {
        // Handle migration if needed
        if (foundUser.id !== fbUser.uid) {
          const migratedUser = { ...foundUser, id: fbUser.uid };
          await setDoc(doc(db, 'users', fbUser.uid), migratedUser);
          foundUser = migratedUser;
        }
        setCurrentUser(foundUser);
        const userApp = applications.find(a => a.userId === foundUser!.id);
        if (userApp) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('apply');
        }
        setShowAuthModal(false);
        showToast(`Welcome back, ${foundUser!.name}! Authorized via safe Google Authentication.`, 'success');
      } else {
        // Create new student profile
        const newStudent: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'External Student',
          email: fbUser.email || '',
          role: 'student',
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'users', fbUser.uid), newStudent);
          const updatedUsers = [...users, newStudent];
          setUsers(updatedUsers);
          localStorage.setItem('exposys_users', JSON.stringify(updatedUsers));

          setCurrentUser(newStudent);
          setCurrentView('apply');
          setShowAuthModal(false);
          showToast(`Account successfully registered! Let's fill your cohort details.`, 'success');
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`);
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Authentication via Google Gateway cancelled or service was unreachable.', 'error');
    }
  };

  // Toast Triggers Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToast({ id: Math.random().toString(), text, type });
  };

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      // Admin Login
      if (authEmail.trim() === 'admin@exposys.com') {
        const foundAdmin = users.find(u => u.email === authEmail && u.role === 'admin');
        if (foundAdmin) {
          setCurrentUser(foundAdmin);
          setCurrentView('admin');
          setShowAuthModal(false);
          showToast('Welcome back, Admin Coordinator! Live sessions synchronised.', 'success');
        } else {
          // Fallback if admin wasn't tracked
          const newAdmin: User = {
            id: 'user_admin_1',
            name: 'Admin Director',
            email: 'admin@exposys.com',
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          
          try {
            await setDoc(doc(db, 'users', newAdmin.id), newAdmin);
            const updatedUsers = [...users, newAdmin];
            setUsers(updatedUsers);
            localStorage.setItem('exposys_users', JSON.stringify(updatedUsers));
            setCurrentUser(newAdmin);
            setCurrentView('admin');
            setShowAuthModal(false);
            showToast('Administrative channel credentials recognized!', 'success');
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${newAdmin.id}`);
          }
        }
        return;
      }

      // Student Account Search
      const foundUser = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase() && u.role === 'student');
      if (foundUser) {
        setCurrentUser(foundUser);
        
        // Find if they have an active application
        const userApp = applications.find(a => a.userId === foundUser.id);
        if (userApp) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('apply');
        }
        setShowAuthModal(false);
        showToast(`Welcome back, ${foundUser.name}! Session initialized.`, 'success');
      } else {
        setAuthError('Email account not recognized. Please register or verify spelling.');
      }
    } else {
      // Register New Student Account Flow
      if (!authName.trim()) return setAuthError('Please specify your profile name.');
      if (!authEmail.trim() || !authEmail.includes('@')) return setAuthError('Input a valid student email.');

      const emailConflict = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
      if (emailConflict) {
        return setAuthError('This email is already registered on our databases.');
      }

      const generatedUserId = `user_student_${Math.random().toString(36).substr(2, 9)}`;
      const generatedUser: User = {
        id: generatedUserId,
        name: authName,
        email: authEmail,
        role: authRoleSelection,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', generatedUserId), generatedUser);
        const updatedUsers = [...users, generatedUser];
        setUsers(updatedUsers);
        localStorage.setItem('exposys_users', JSON.stringify(updatedUsers));

        setCurrentUser(generatedUser);
        setShowAuthModal(false);
        showToast('Student credentials generated in portal. Proceed with registration!', 'success');
        
        if (generatedUser.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('apply');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${generatedUserId}`);
      }
    }
  };

  // Fast registration payment action directly from Landing Hero Stripe component
  const handleQuickSignUpAndPay = async (name: string, email: string, domain: string, subscription: StripeSubscription) => {
    // 1. Create student User account
    const generatedUserId = `user_student_${Math.random().toString(36).substr(2, 9)}`;
    const studentUser: User = {
      id: generatedUserId,
      name,
      email,
      role: 'student',
      createdAt: new Date().toISOString()
    };

    // 2. Draft matching application
    const newApplication: InternshipApplication = {
      id: `app_quick_${Math.random().toString(36).substr(2, 9)}`,
      userId: generatedUserId,
      name,
      email,
      phone: '+91 9999900000',
      branch: 'Engineering / Science',
      college: 'Selected Institution',
      tenthPercentage: '90.0',
      twelfthPercentage: '90.0',
      ug: 'Passed UG Tier 1 (Simulated)',
      location: 'Bengaluru, India',
      internshipDomain: domain,
      internshipDuration: '2 Months',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      paymentId: subscription.id,
      subscription
    };

    // 3. Draft Welcome Notification alert
    const welcomeAlert: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: generatedUserId,
      title: 'Stripe Subscription Processed! 💳',
      message: `Your professional slot charge of ₹${subscription.amount} is verified. Your domain candidate track (${domain}) is queued for core advisory review.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', studentUser.id), studentUser);
      await setDoc(doc(db, 'applications', newApplication.id), newApplication);
      await setDoc(doc(db, 'notifications', welcomeAlert.id), welcomeAlert);

      const newUsers = [...users, studentUser];
      const newApps = [newApplication, ...applications];
      const newNotifs = [welcomeAlert, ...notifications];

      setUsers(newUsers);
      setApplications(newApps);
      setNotifications(newNotifs);

      localStorage.setItem('exposys_users', JSON.stringify(newUsers));
      localStorage.setItem('exposys_applications', JSON.stringify(newApps));
      localStorage.setItem('exposys_notifications', JSON.stringify(newNotifs));

      setCurrentUser(studentUser);
      setCurrentView('dashboard');
      showToast('Stripe payment accepted! Application file created successfully.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch-quick-sign-up');
    }
  };

  // Submit Detailed Form Handler
  const handleSubmitDetailedApplication = async (applicationPayload: Partial<InternshipApplication>) => {
    let targetUser = currentUser;

    // Create user on the fly if not logged in
    if (!targetUser) {
      const generatedUserId = `user_student_${Math.random().toString(36).substr(2, 9)}`;
      targetUser = {
        id: generatedUserId,
        name: applicationPayload.name || 'Student Candidate',
        email: applicationPayload.email || 'candidate@gmail.com',
        role: 'student',
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', targetUser.id), targetUser);
        const newUsers = [...users, targetUser];
        setUsers(newUsers);
        localStorage.setItem('exposys_users', JSON.stringify(newUsers));
        setCurrentUser(targetUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${targetUser.id}`);
      }
    }

    // Complete internship application object
    const finalApplication: InternshipApplication = {
      id: `app_detailed_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetUser.id,
      name: applicationPayload.name || targetUser.name,
      email: applicationPayload.email || targetUser.email,
      phone: applicationPayload.phone || '',
      branch: applicationPayload.branch || '',
      college: applicationPayload.college || '',
      tenthPercentage: applicationPayload.tenthPercentage || '',
      twelfthPercentage: applicationPayload.twelfthPercentage || '',
      ug: applicationPayload.ug || '',
      pg: applicationPayload.pg || '',
      location: applicationPayload.location || '',
      internshipDomain: applicationPayload.internshipDomain || 'Data Science',
      internshipDuration: applicationPayload.internshipDuration || '2 Months',
      linkedin: applicationPayload.linkedin || '',
      github: applicationPayload.github || '',
      skills: applicationPayload.skills || '',
      whyHire: applicationPayload.whyHire || '',
      resumeUrl: applicationPayload.resumeUrl || 'resume_portfolio.pdf',
      notes: applicationPayload.notes || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      paymentId: applicationPayload.paymentId || 'ch_default',
      subscription: applicationPayload.subscription
    };

    // Construct alert notifications
    const triggerNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetUser.id,
      title: 'Detailed Profile Registered 🚀',
      message: `Hi ${targetUser.name}! Your detailed application credentials in ${finalApplication.internshipDomain} have been catalogued. Auto billing renews monthly.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'applications', finalApplication.id), finalApplication);
      await setDoc(doc(db, 'notifications', triggerNotif.id), triggerNotif);

      // Update state & storage
      const newAppsList = [finalApplication, ...applications.filter(a => a.userId !== targetUser!.id)];
      const newNotifsList = [triggerNotif, ...notifications];

      setApplications(newAppsList);
      setNotifications(newNotifsList);

      localStorage.setItem('exposys_applications', JSON.stringify(newAppsList));
      localStorage.setItem('exposys_notifications', JSON.stringify(newNotifsList));

      setCurrentView('dashboard');
      showToast('Your detailed internship portfolio has been indexed!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${finalApplication.id}`);
    }
  };

  // Student Update Stripe Subscription action
  const handleUpdateSubscription = async (updatedSub: StripeSubscription | null) => {
    if (!currentUser) return;
    
    const appToUpdate = applications.find(a => a.userId === currentUser.id);
    if (!appToUpdate) return;

    const updatedApp: InternshipApplication = {
      ...appToUpdate,
      subscription: updatedSub ? updatedSub : undefined
    };

    try {
      await setDoc(doc(db, 'applications', updatedApp.id), updatedApp);

      const updatedApps = applications.map(app => {
        if (app.userId === currentUser.id) {
          return updatedApp;
        }
        return app;
      });

      setApplications(updatedApps);
      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `applications/${updatedApp.id}`);
    }
  };

  const handleUpdateAppStatus = async (status: 'Pending' | 'Approved' | 'Rejected' | 'Completed') => {
    if (!currentUser) return;

    const appToUpdate = applications.find(a => a.userId === currentUser.id);
    if (!appToUpdate) return;

    const updatedApp: InternshipApplication = { ...appToUpdate, status };

    try {
      await setDoc(doc(db, 'applications', updatedApp.id), updatedApp);

      const updatedApps = applications.map(app => {
        if (app.userId === currentUser.id) {
          return updatedApp;
        }
        return app;
      });

      setApplications(updatedApps);
      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `applications/${updatedApp.id}`);
    }
  };

  // Dynamic Student Application Selector
  const studentApplication = currentUser 
    ? applications.find(a => a.userId === currentUser.id) || null 
    : null;

  // Notification Inbox Managers
  const handleMarkNotifRead = async (id: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    if (!targetNotif) return;

    const updatedNotif = { ...targetNotif, read: true };

    try {
      await setDoc(doc(db, 'notifications', id), updatedNotif);

      const updated = notifications.map(n => n.id === id ? updatedNotif : n);
      setNotifications(updated);
      localStorage.setItem('exposys_notifications', JSON.stringify(updated));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleClearNotifications = async () => {
    if (!currentUser) return;
    const MatchedNotifs = notifications.filter(n => n.userId === currentUser.id);
    
    try {
      for (const n of MatchedNotifs) {
        await deleteDoc(doc(db, 'notifications', n.id));
      }

      const filtered = notifications.filter(n => n.userId !== currentUser.id);
      setNotifications(filtered);
      localStorage.setItem('exposys_notifications', JSON.stringify(filtered));
      showToast('Student in-app alert box wiped cleaner.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications');
    }
  };

  // Admin Decisions Actions
  const handleApproveAppByAdmin = async (appId: string, name: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const updatedApp: InternshipApplication = { 
      ...targetApp, 
      status: 'Approved' as const,
      subscription: targetApp.subscription ? { ...targetApp.subscription, status: 'active' as const } : undefined
    };

    // Alert Notification dispatch
    const approvalAlert: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetApp.userId,
      title: 'Onboarding Approved! 🎉',
      message: `Congratulations! Your application file is officially Approved. Your Stripe sandbox keys are ready inside the student dashboard.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };

    // Operational Logs
    const operationsLog: AdminLog = {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      adminId: currentUser?.id || 'admin_1',
      action: 'APPROVE_STUDENT_FILE',
      targetUser: `${name} (${targetApp.internshipDomain || 'Engineering'})`,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'applications', appId), updatedApp);
      await setDoc(doc(db, 'notifications', approvalAlert.id), approvalAlert);
      await setDoc(doc(db, 'logs', operationsLog.id), operationsLog);

      const updatedApps = applications.map(app => app.id === appId ? updatedApp : app);
      const newLogs = [operationsLog, ...logs];
      const newNotifs = [approvalAlert, ...notifications];

      setApplications(updatedApps);
      setNotifications(newNotifs);
      setLogs(newLogs);

      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
      localStorage.setItem('exposys_notifications', JSON.stringify(newNotifs));
      localStorage.setItem('exposys_logs', JSON.stringify(newLogs));

      showToast(`Approved ${name} into active cohort. Student alerted!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${appId}`);
    }
  };

  const handleRejectAppByAdmin = async (appId: string, name: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const updatedApp: InternshipApplication = { ...targetApp, status: 'Rejected' as const };

    const rejectionAlert: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetApp.userId,
      title: 'Onboarding Action Required ⚠️',
      message: `We regret to report that the credentials on file does not fulfill current prerequisites. Please review location requirements.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    };

    const operationsLog: AdminLog = {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      adminId: currentUser?.id || 'admin_1',
      action: 'REJECT_STUDENT_FILE',
      targetUser: `${name} (${targetApp.internshipDomain || 'Engineering'})`,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'applications', appId), updatedApp);
      await setDoc(doc(db, 'notifications', rejectionAlert.id), rejectionAlert);
      await setDoc(doc(db, 'logs', operationsLog.id), operationsLog);

      const updatedApps = applications.map(app => app.id === appId ? updatedApp : app);
      const newLogs = [operationsLog, ...logs];
      const newNotifs = [rejectionAlert, ...notifications];

      setApplications(updatedApps);
      setNotifications(newNotifs);
      setLogs(newLogs);

      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
      localStorage.setItem('exposys_notifications', JSON.stringify(newNotifs));
      localStorage.setItem('exposys_logs', JSON.stringify(newLogs));

      showToast(`Rejection logged for candidate ${name}.`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${appId}`);
    }
  };

  const handleMarkCompletedByAdmin = async (appId: string, name: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const updatedApp: InternshipApplication = { ...targetApp, status: 'Completed' as const };

    const completionAlert: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetApp.userId,
      title: 'Internship Completed Successfully! 🏆',
      message: `Salutations! You have passed all evaluation parameters. Your verifiable digital Gold Certificate is now unlocked inside your student panel!`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };

    const operationsLog: AdminLog = {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      adminId: currentUser?.id || 'admin_1',
      action: 'ISSUED_GOLD_CERTIFICATE',
      targetUser: name,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'applications', appId), updatedApp);
      await setDoc(doc(db, 'notifications', completionAlert.id), completionAlert);
      await setDoc(doc(db, 'logs', operationsLog.id), operationsLog);

      const updatedApps = applications.map(app => app.id === appId ? updatedApp : app);
      const newLogs = [operationsLog, ...logs];
      const newNotifs = [completionAlert, ...notifications];

      setApplications(updatedApps);
      setNotifications(newNotifs);
      setLogs(newLogs);

      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
      localStorage.setItem('exposys_notifications', JSON.stringify(newNotifs));
      localStorage.setItem('exposys_logs', JSON.stringify(newLogs));

      showToast(`Issued digital Gold verification seal for ${name}!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${appId}`);
    }
  };

  const handleDeleteAppByAdmin = async (appId: string) => {
    try {
      await deleteDoc(doc(db, 'applications', appId));

      const updatedApps = applications.filter(app => app.id !== appId);
      setApplications(updatedApps);
      localStorage.setItem('exposys_applications', JSON.stringify(updatedApps));
      showToast(`Safely deleted applicant application context from system.`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `applications/${appId}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Securely logged out from active slot. Invoices saved.', 'info');
  };


  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-hidden antialiased bg-[#f8fafc] text-slate-900">
      
      {/* Dynamic Animated AI Signals Tech Background Layer - clearly visible */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Subtle Panning Neural Network Backdrop Pattern - Full opacity */}
        <div 
          className="absolute inset-0 bg-repeat bg-center opacity-100 ai-bg-pan" 
          style={{ 
            backgroundImage: `url('/src/assets/images/ai_signals_bg_1779695437813.png')`,
            backgroundSize: '1100px 1100px',
          }}
        />

        {/* Ambient Gradient Blobs (Glowing Neural Nodes) */}
        <div className="absolute top-[12%] left-[8%] w-80 h-80 rounded-full blur-[110px] ai-signal-pulse bg-cyan-400/[0.45]" />
        <div className="absolute bottom-[25%] right-[10%] w-96 h-[380px] rounded-full bg-indigo-500/[0.40] blur-[120px] ai-signal-pulse-delayed" />
        
        {/* Animated Moving SVG Signals Connectors Grid */}
        <svg className="absolute inset-0 w-full h-full stroke-cyan-500/[0.65] fill-none" xmlns="http://www.w3.org/2000/svg">
          {/* Signal path 1 */}
          <path d="M-100 220 C320 160, 420 420, 820 310 S1220 110, 2020 270" strokeWidth="2.5" className="ai-path-flow" />
          {/* Signal path 2 */}
          <path d="M-50 620 S420 390, 920 670 S1520 470, 2070 720" strokeWidth="3" className="ai-path-flow-fast" />
          {/* Signal path 3 */}
          <path d="M120 -50 C220 420, 620 620, 1120 820 S1720 970, 2120 1120" strokeWidth="2" className="ai-path-flow" />
          
          {/* Pulse Signal Nodes overlay */}
          <circle cx="280" cy="184" r="6" className="fill-cyan-400 animate-pulse" />
          <circle cx="682" cy="331" r="7.5" className="fill-indigo-400 animate-pulse" />
          <circle cx="1120" cy="805" r="6.5" className="fill-pink-400 animate-pulse" />
          <circle cx="1520" cy="501" r="7" className="fill-cyan-500 animate-pulse" />
        </svg>

        {/* Binary Stream falling code backdrop */}
        <div className="absolute inset-0 opacity-[0.25] font-mono text-[10px] text-cyan-600 select-none overflow-hidden leading-none p-4 grid grid-cols-6 gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5 whitespace-pre">
              {Array.from({ length: 20 }).map((_, j) => (
                <span key={j} className="animate-pulse" style={{ animationDelay: `${(i * j * 140) % 2500}ms` }}>
                  {Math.random() > 0.5 ? '010101' : '110011'}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Alert Indicator */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Area */}
      <div className="relative z-10">
        <Navbar 
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          onOpenLogin={() => {
            setAuthMode('login');
            setAuthEmail('');
            setAuthPassword('');
            setAuthError('');
            setShowAuthModal(true);
          }}
        />
      </div>

      {/* Primary Dynamic Main Views Panels */}
      <div className="flex-1 flex flex-col relative z-10">
        {currentView === 'landing' && (
          <>
            <CompanyLogosTrain />
            <LandingHero 
              currentUser={currentUser}
              onNavigate={setCurrentView}
              onQuickSignUpAndPay={handleQuickSignUpAndPay}
              onOpenLogin={() => {
                setAuthMode('login');
                setAuthEmail('');
                setAuthPassword('');
                setAuthError('');
                setShowAuthModal(true);
              }}
            />
          </>
        )}

        {currentView === 'apply' && (
          <ApplicationForm 
            currentUser={currentUser}
            onSubmitApplication={handleSubmitDetailedApplication}
            onNavigate={setCurrentView}
            onOpenLogin={() => {
              setAuthMode('login');
              setAuthEmail('');
              setAuthPassword('');
              setAuthError('');
              setShowAuthModal(true);
            }}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <StudentDashboard 
            currentUser={currentUser}
            application={studentApplication}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotifRead}
            onClearNotifications={handleClearNotifications}
            onUpdateSubscription={handleUpdateSubscription}
            onUpdateAppStatus={handleUpdateAppStatus}
            onShowToast={showToast}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'admin' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard 
            currentUser={currentUser}
            applications={applications}
            logs={logs}
            onApproveApplication={handleApproveAppByAdmin}
            onRejectApplication={handleRejectAppByAdmin}
            onMarkCompleted={handleMarkCompletedByAdmin}
            onDeleteApplication={handleDeleteAppByAdmin}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Core Contact Footer Coordinates Panel as specified by guidelines */}
      <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-xs leading-relaxed">
          
          {/* Col 1 Brand detail */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-base">
                E
              </div>
              <span className="font-extrabold text-base text-white tracking-widest uppercase">
                EXPOSYS <span className="text-cyan-400">DATA LABS</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm">
              An engineering-certified practices workspace. We foster digital literacy, cloud-native scalability solutions, and professional student cohorts.
            </p>
            <p className="text-slate-600 font-bold select-none text-[10px]">
              © 2026 Exposys Data Labs Portal. All rights preserved.
            </p>
          </div>

          {/* Col 2 Coordinates data structure */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-sans">Contact Coordinates</h4>
            <div className="space-y-4 text-slate-400">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span>hr@exposysdata.com</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span>+91 7795207065</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
                <div className="leading-relaxed font-sans text-slate-300">
                  <span className="font-extrabold text-white block mb-1">Office Address</span>
                  Exposys Data Labs <br />
                  #56, YVR Cave, 4th Floor <br />
                  Kakolu Road, Rajanukunte <br />
                  Yelahanka, Bengaluru – 560064
                </div>
              </div>
            </div>
          </div>

          {/* Col 3 Legal clauses lists & Social vectors */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Regulatory Information</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Services</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Cookies Policy</a>
            </div>
            
            {/* Social SVGs anchors list */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-slate-500 font-extrabold select-none text-[10px] uppercase tracking-wider block">Connect with us</span>
              <div className="flex flex-col gap-2">
                <a href="https://api.whatsapp.com/send?phone=917795207065" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-450 text-slate-400 hover:text-green-400 transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>WhatsApp</span>
                </a>
                <a href="https://www.facebook.com/Exposysdatalabs/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-450 text-slate-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Facebook</span>
                </a>
                <a href="https://www.linkedin.com/company/upchat-technologies/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-450 text-slate-400 hover:text-cyan-400 transition-colors">
                  <Linkedin className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>LinkedIn</span>
                </a>
                <a href="https://www.youtube.com/channel/UCCdSuhhzWqmj9h9uyEl-JSA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-450 text-slate-400 hover:text-red-400 transition-colors">
                  <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                  <span>YouTube</span>
                </a>
                <a href="https://www.instagram.com/exposysdatalabs/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-450 text-slate-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Student/Coach Auth Dialouge box modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative space-y-6 text-left">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
              title="Close modal"
            >
              ✕
            </button>

            {/* Toggle Modes layout */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl select-none">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Modal Heading copy */}
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {authMode === 'login' ? 'Interactive Secure Access' : 'Create Student Profile'}
              </h3>
              <p className="text-slate-400 text-xs">
                {authMode === 'login' 
                  ? 'Input admin credentials or registered applicant email.'
                  : 'Allows automatic filing logs upon generation.'
                }
              </p>
            </div>

            {/* Authorization Inputs Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Special admin test tip info */}
              {authMode === 'login' && (
                <div className="p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-900 leading-normal">
                  💡 <strong>Test Accounts:</strong><br />
                  - Admin Console: <code className="bg-white px-1 py-0.2 rounded font-mono font-bold">admin@exposys.com</code> (any pass)<br />
                  - Student Area: <code className="bg-white px-1 py-0.2 rounded font-mono font-bold">rahul.sharma@gmail.com</code> (any pass)
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-xs font-semibold text-slate-700 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@exposys.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-xs font-semibold text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-xs font-semibold text-slate-700 font-medium"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2 select-none">
                    <button
                      type="button"
                      onClick={() => setAuthRoleSelection('student')}
                      className={`py-1.5 px-3 border rounded-xl text-[10px] font-bold transition-all ${
                        authRoleSelection === 'student' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      Student Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRoleSelection('admin')}
                      className={`py-1.5 px-3 border rounded-xl text-[10px] font-bold transition-all ${
                        authRoleSelection === 'admin' 
                          ? 'border-purple-600 bg-purple-50 text-purple-700' 
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      Admin Panel
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 btn-gradient text-white font-bold text-xs rounded-xl shadow-md tracking-wider flex items-center justify-center gap-1.5"
              >
                {authMode === 'login' ? (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize Session</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Generate Student Profile</span>
                  </>
                )}
              </button>

              {/* Secure Firebase Google Authentication Gate */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-slate-300 text-[9px] font-extrabold tracking-widest uppercase">Secure Auth Gateway</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-11 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.463 0 4.113 1.018 5.056 1.916l3.235-3.116C18.3 1.341 15.534 0 12.24 0 5.58 0 0 5.373 0 12s5.58 12 12.24 12c6.96 0 11.57-4.838 11.57-11.79 0-.795-.085-1.4-.188-1.925H12.24z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
