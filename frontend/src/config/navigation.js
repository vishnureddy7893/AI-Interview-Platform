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
      { name: "Complete Profile", icon: User, page: "profile" },
      { name: "Applied Jobs", icon: Briefcase, page: "applications" },
      { name: "Assessments", icon: ClipboardList, page: "assessments" },
      { name: "Interviews", icon: CalendarDays, page: "interviews" },
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