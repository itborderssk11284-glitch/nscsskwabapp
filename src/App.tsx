/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { RoleLoginModal } from './components/RoleLoginModal';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { WorkloadCalculatorView } from './components/WorkloadCalculatorView';
import { JobValuationTableView } from './components/JobValuationTableView';
import { StaffingOptimizerView } from './components/StaffingOptimizerView';
import { LeanAndSafetyView } from './components/LeanAndSafetyView';
import { UserManagementView } from './components/UserManagementView';
import { CloudFilesView } from './components/CloudFilesView';
import { LoginScreen } from './components/LoginScreen';
import { FourPillarReportModal } from './components/FourPillarReportModal';
import {
  syncRosterToRealtimeDb,
  subscribeToRosterFromRealtimeDb,
  logoutFirebaseUser
} from './services/firebaseService';

import {
  DepartmentId,
  NursingActivity,
  ProductivityCalculationResult,
  ReportTimeframe,
  ShiftRosterData,
  UserProfile
} from './types/nursing';
import {
  DEFAULT_USERS,
  DEPARTMENTS,
  INITIAL_SHIFT_ROSTERS,
  MASTER_NURSING_ACTIVITIES,
  SANGKHLABURI_HOSPITAL_META
} from './data/mockNursingData';
import {
  calculateDepartmentProductivity,
  generateFourPillarReport
} from './utils/productivityCalculator';

export default function App() {
  // 1. User State (Direct Access + Firebase Auth Option)
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]);
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  // 2. Active Department & Navigation State
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('er');
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('daily');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // 3. Clinical Master Data State
  const [activities, setActivities] = useState<NursingActivity[]>(MASTER_NURSING_ACTIVITIES);
  const [shiftRosters, setShiftRosters] = useState<Record<DepartmentId, ShiftRosterData>>(
    INITIAL_SHIFT_ROSTERS
  );

  // Realtime Database: Subscribe to live shift roster changes for the selected ward
  useEffect(() => {
    const unsub = subscribeToRosterFromRealtimeDb(selectedDeptId, (liveRoster) => {
      if (liveRoster) {
        setShiftRosters((prev) => ({
          ...prev,
          [selectedDeptId]: liveRoster,
        }));
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [selectedDeptId]);

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // 4. Compute live productivity results for all 5 wards (ER, IPD1, IPD2, OPD, LR)
  const deptResults: Record<DepartmentId, ProductivityCalculationResult> = useMemo(() => {
    const results: Partial<Record<DepartmentId, ProductivityCalculationResult>> = {};
    DEPARTMENTS.forEach((dept) => {
      const roster = shiftRosters[dept.id] || INITIAL_SHIFT_ROSTERS[dept.id];
      results[dept.id] = calculateDepartmentProductivity(dept.id, roster, activities, timeframe);
    });
    return results as Record<DepartmentId, ProductivityCalculationResult>;
  }, [shiftRosters, activities, timeframe]);

  // Current department calculation result
  const currentResult = deptResults[selectedDeptId] || deptResults['er'];

  // Current official 4-pillar report
  const currentReport = useMemo(() => {
    return generateFourPillarReport(
      selectedDeptId,
      currentResult,
      currentUser.name,
      currentUser.roleTitle,
      timeframe
    );
  }, [selectedDeptId, currentResult, currentUser, timeframe]);

  // Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setShowLoginScreen(false);
    // Add user to local list if not already present
    setUsers((prev) => {
      if (prev.some((u) => u.id === user.id || (user.email && u.email && u.email === user.email))) {
        return prev;
      }
      return [user, ...prev];
    });
    if (user.departmentId && user.departmentId !== 'all') {
      setSelectedDeptId(user.departmentId as DepartmentId);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebaseUser();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setShowLoginScreen(true);
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdateRoster = (deptId: DepartmentId, newRoster: ShiftRosterData) => {
    setShiftRosters((prev) => ({
      ...prev,
      [deptId]: newRoster,
    }));
    // Sync to Realtime Database
    syncRosterToRealtimeDb(deptId, newRoster);
  };

  const handleUpdateActivity = (updated: NursingActivity) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === updated.id ? updated : act))
    );
  };

  const handleAddActivity = (newAct: NursingActivity) => {
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleResetData = () => {
    setActivities(MASTER_NURSING_ACTIVITIES);
    setShiftRosters(INITIAL_SHIFT_ROSTERS);
    setUsers(DEFAULT_USERS);
    setSelectedDeptId('er');
    setActiveTab('executive');
    setTimeframe('daily');
  };

  if (showLoginScreen) {
    return (
      <LoginScreen
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setShowLoginScreen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans selection:bg-teal-700 selection:text-white text-slate-800">
      {/* 1. Left Sidebar Navigation (เมนูหลักอยู่ด้านข้างซ้าย) */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Viewport (offset by 68 Tailwind units on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68">
        {/* Top Header bar with Department Select and Mobile Menu */}
        <TopHeader
          selectedDeptId={selectedDeptId}
          onSelectDept={setSelectedDeptId}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'executive' && (
            <ExecutiveSummaryView
              deptResults={deptResults}
              onSelectDepartment={(id) => {
                setSelectedDeptId(id);
                setActiveTab('calculator');
              }}
              onNavigateToTab={setActiveTab}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              timeframe={timeframe}
              onSelectTimeframe={setTimeframe}
            />
          )}

          {activeTab === 'calculator' && (
            <WorkloadCalculatorView
              selectedDeptId={selectedDeptId}
              onSelectDept={setSelectedDeptId}
              roster={shiftRosters[selectedDeptId]}
              onUpdateRoster={handleUpdateRoster}
              result={currentResult}
              currentUser={currentUser}
              activities={activities}
            />
          )}

          {activeTab === 'job_valuation' && (
            <JobValuationTableView
              activities={activities}
              onUpdateActivity={handleUpdateActivity}
              onAddActivity={handleAddActivity}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'optimizer' && (
            <StaffingOptimizerView
              deptResults={deptResults}
              selectedDeptId={selectedDeptId}
              onSelectDept={setSelectedDeptId}
            />
          )}

          {activeTab === 'files' && (
            <CloudFilesView
              currentUser={currentUser}
              selectedDeptId={selectedDeptId}
              onSelectDept={setSelectedDeptId}
            />
          )}

          {activeTab === 'lean_safety' && <LeanAndSafetyView />}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500 no-print mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">{SANGKHLABURI_HOSPITAL_META.systemName}</span>
              <span>·</span>
              <span>กลุ่มงานการพยาบาล</span>
              <span>·</span>
              <span>อัตรากำลัง: พยาบาลวิชาชีพ (RN: Registered Nurse)</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span>5 แผนกหลัก: ER · IPD 1 · IPD 2 · OPD · LR</span>
              <span>·</span>
              <span>รอบรายงาน: {timeframe === 'yearly' ? 'รายปี' : timeframe === 'monthly' ? 'รายเดือน' : 'รายวัน'}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Role-Based Authentication & Switcher Modal */}
      <RoleLoginModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        users={users}
      />

      {/* Formal Four-Pillar Report & Print Modal */}
      <FourPillarReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={currentReport}
        activities={activities}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
      />
    </div>
  );
}
