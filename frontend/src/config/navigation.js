import {
  House,
  User,
  Briefcase,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LayoutDashboard,
  FileText,
  CalendarCheck,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";

const navigation = {
  candidate: {
    brand: "CareerHub",
    logoutKey: "candidate",
    logoutPath: "/candidate/login",
    items: [
      { name: "Dashboard", icon: House, page: "home" },
      { name: "Jobs", icon: Briefcase, page: "jobs" },
      { name: "Applications", icon: ClipboardList, page: "applications" },
      { name: "Resume", icon: FileText, page: "resume" },
      { name: "Reports", icon: BarChart3, page: "reports" },
      { name: "Notifications", icon: Bell, page: "notifications" },
      { name: "Settings", icon: Settings, page: "settings" },
    ],
  },
  recruiter: {
    brand: "RecruitPro",
    logoutKey: "recruiter",
    logoutPath: "/recruiter/login",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "home" },
      { name: "My Jobs", icon: Briefcase, page: "my-jobs" },
      { name: "Applications", icon: FileText, page: "applications" },
      { name: "Interviews", icon: CalendarCheck, page: "interviews" },
      { name: "Performance", icon: TrendingUp, page: "performance" },
      { name: "Profile", icon: UserCircle, page: "profile" },
    ],
  },
  companyadmin: {
    brand: "CompanyHQ",
    logoutKey: "companyadmin",
    logoutPath: "/company/login",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "home" },
      { name: "Jobs", icon: Briefcase, page: "jobs" },
      { name: "Team", icon: Users, page: "team" },
      { name: "Reports", icon: BarChart3, page: "reports" },
      { name: "Settings", icon: Settings, page: "settings" },
    ],
  },
};

export default navigation;