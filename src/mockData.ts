import { User, InternshipApplication, Notification } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Admin Director',
    email: 'admin@exposys.com',
    role: 'admin',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user_std_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    role: 'student',
    createdAt: '2026-05-15T08:30:00Z'
  },
  {
    id: 'user_std_2',
    name: 'Priya Patel',
    email: 'priya.patel@bits-pilani.ac.in',
    role: 'student',
    createdAt: '2026-05-20T14:45:00Z'
  },
  {
    id: 'user_std_3',
    name: 'Amit Kumar',
    email: 'amit.kumar@iitb.ac.in',
    role: 'student',
    createdAt: '2026-05-22T09:15:00Z'
  },
  {
    id: 'user_std_4',
    name: 'Neha Roy',
    email: 'neha.roy@rvce.edu.in',
    role: 'student',
    createdAt: '2026-05-24T11:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: InternshipApplication[] = [
  {
    id: 'app_1',
    userId: 'user_std_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 9876543210',
    branch: 'Computer Science & Engineering',
    college: 'IIT Madras',
    tenthPercentage: '94.6',
    twelfthPercentage: '92.4',
    ug: 'B.Tech CS - 8.9 CGPA',
    pg: '',
    location: 'Chennai, Tamil Nadu',
    internshipDomain: 'Data Science',
    internshipDuration: '2 Months',
    linkedin: 'https://linkedin.com/in/rahulsharma',
    github: 'https://github.com/rahulsharma',
    skills: 'Python, Pandas, Scikit-Learn, SQL, Machine Learning',
    whyHire: 'I want to apply state-of-the-art data modeling to real industries and learn the production cycle from engineering leaders.',
    resumeUrl: 'rahul_sharma_resume.pdf',
    notes: 'Excited about the December cohort.',
    status: 'Approved',
    createdAt: '2026-05-15T09:00:00Z',
    paymentId: 'ch_stripe_1a8f9z3x',
    subscription: {
      id: 'sub_1234_rahul',
      status: 'active',
      planName: 'Professional Research Track',
      amount: 999,
      currency: 'INR',
      interval: 'month',
      currentPeriodEnd: '2026-06-15T09:00:00Z',
      cardBrand: 'visa',
      cardLast4: '4242',
      createdAt: '2026-05-15T09:00:00Z'
    }
  },
  {
    id: 'app_2',
    userId: 'user_std_2',
    name: 'Priya Patel',
    email: 'priya.patel@bits-pilani.ac.in',
    phone: '+91 8765432109',
    branch: 'Information Systems',
    college: 'BITS Pilani',
    tenthPercentage: '95.2',
    twelfthPercentage: '94.8',
    ug: 'B.E. Information Systems - 9.1 CGPA',
    pg: '',
    location: 'Mumbai, Maharashtra',
    internshipDomain: 'Full Stack Development',
    internshipDuration: '3 Months',
    linkedin: 'https://linkedin.com/in/priyapatel',
    github: 'https://github.com/priyapatel',
    skills: 'React, Node.js, Express, MongoDB, Tailwind, TypeScript',
    whyHire: 'I have built multiple side projects under React and want exposure to system design, API optimization, and real users.',
    resumeUrl: 'priya_patel_resume.pdf',
    notes: 'Can join immediately.',
    status: 'Pending',
    createdAt: '2026-05-20T15:00:00Z',
    paymentId: 'ch_stripe_2b7y8v2q',
    subscription: {
      id: 'sub_5678_priya',
      status: 'active',
      planName: 'Professional Fast-Track',
      amount: 999,
      currency: 'INR',
      interval: 'month',
      currentPeriodEnd: '2026-06-20T15:00:00Z',
      cardBrand: 'mastercard',
      cardLast4: '5555',
      createdAt: '2026-05-20T15:00:00Z'
    }
  },
  {
    id: 'app_3',
    userId: 'user_std_3',
    name: 'Amit Kumar',
    email: 'amit.kumar@iitb.ac.in',
    phone: '+91 7654321098',
    branch: 'Electrical Engineering',
    college: 'IIT Bombay',
    tenthPercentage: '91.2',
    twelfthPercentage: '89.5',
    ug: 'B.Tech Electrical - 7.8 CGPA',
    pg: 'M.Tech Microelectronics - 8.2 CGPA',
    location: 'Pune, Maharashtra',
    internshipDomain: 'Artificial Intelligence',
    internshipDuration: '6 Months',
    linkedin: 'https://linkedin.com/in/amitkumar',
    github: 'https://github.com/amitkumar',
    skills: 'TensorFlow, Keras, OpenCV, CNNs, Python',
    whyHire: 'Deep interest in computer vision and artificial neural networks. Looking for a mentor to guide my research paper.',
    resumeUrl: 'amit_kumar_resume.pdf',
    notes: 'Applying for part-time/remote if possible.',
    status: 'Pending',
    createdAt: '2026-05-22T09:30:00Z',
    paymentId: 'ch_stripe_8y2x7n9v',
    subscription: {
      id: 'sub_9012_amit',
      status: 'trialing',
      planName: 'Professional Research Track',
      amount: 999,
      currency: 'INR',
      interval: 'month',
      currentPeriodEnd: '2026-06-22T09:30:00Z',
      cardBrand: 'amex',
      cardLast4: '1007',
      createdAt: '2026-05-22T09:30:00Z'
    }
  },
  {
    id: 'app_4',
    userId: 'user_std_4',
    name: 'Neha Roy',
    email: 'neha.roy@rvce.edu.in',
    phone: '+91 6543210987',
    branch: 'Electronics and Communication',
    college: 'RV College of Engineering',
    tenthPercentage: '96.5',
    twelfthPercentage: '95.0',
    ug: 'B.E. ECE - 9.3 CGPA',
    pg: '',
    location: 'Bengaluru, Karnataka',
    internshipDomain: 'UI/UX Design',
    internshipDuration: '1 Month',
    linkedin: 'https://linkedin.com/in/neharoy',
    github: 'https://github.com/neharoy',
    skills: 'Figma, Adobe XD, Design Systems, HTML/CSS, Prototyping',
    whyHire: 'Passionate about structural aesthetics and human-computer interactions. Ready to work on active client portals.',
    resumeUrl: 'neha_roy_resume.pdf',
    notes: 'Reside in Bengaluru, can attend office if offline option is offered.',
    status: 'Pending',
    createdAt: '2026-05-24T11:15:00Z',
    paymentId: 'ch_stripe_4n8v2y5x',
    subscription: {
      id: 'sub_3456_neha',
      status: 'active',
      planName: 'Professional Fast-Track',
      amount: 999,
      currency: 'INR',
      interval: 'month',
      currentPeriodEnd: '2026-06-24T11:15:00Z',
      cardBrand: 'visa',
      cardLast4: '8888',
      createdAt: '2026-05-24T11:15:00Z'
    }
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not_1',
    userId: 'user_std_1',
    title: 'Application Approved! 🎓',
    message: 'Congratulations! Your internship application for Data Science has been approved by the Exposys Data Labs selection board. Your Stripe monthly subscription is now active.',
    type: 'success',
    read: false,
    createdAt: '2026-05-18T10:00:00Z'
  },
  {
    id: 'not_2',
    userId: 'user_std_2',
    title: 'Payment Verification Successful 💳',
    message: 'Your registration fee of ₹999/mo was successfully processed. Your application is under review by our onboarding team.',
    type: 'info',
    read: false,
    createdAt: '2026-05-20T15:05:00Z'
  }
];

export function initializeDatabase() {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('exposys_users')) {
    localStorage.setItem('exposys_users', JSON.stringify(INITIAL_USERS));
  }
  
  if (!localStorage.getItem('exposys_applications')) {
    localStorage.setItem('exposys_applications', JSON.stringify(INITIAL_APPLICATIONS));
  }
  
  if (!localStorage.getItem('exposys_notifications')) {
    localStorage.setItem('exposys_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  
  if (!localStorage.getItem('exposys_logs')) {
    localStorage.setItem('exposys_logs', JSON.stringify([
      {
        id: 'log_1',
        adminId: 'user_admin_1',
        action: 'APPROVED_APPLICATION',
        targetUser: 'Rahul Sharma (Data Science)',
        createdAt: '2026-05-18T10:00:00Z'
      }
    ]));
  }
}
