import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatTime } from '@/lib/utils';
import { Link } from 'wouter';

interface SessionData {
  id: number;
  type: 'study' | 'break';
  date: string;
  duration: number;
  completed: boolean;
}

interface DailyReport {
  date: string;
  formattedDate: string;
  totalStudyTime: number;
  totalBreakTime: number;
  completedSessions: number;
  incompleteSessions: number;
}

export default function Reports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    // Load session data from localStorage
    try {
      const sessionsData = JSON.parse(localStorage.getItem('studySessionsData') || '[]') as SessionData[];
      
      if (sessionsData.length === 0) {
        return;
      }
      
      // Group sessions by date (YYYY-MM-DD)
      const groupedByDate: Record<string, SessionData[]> = {};
      
      sessionsData.forEach(session => {
        const date = new Date(session.date).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(session);
      });
      
      // Create reports for each day
      const dailyReports: DailyReport[] = Object.entries(groupedByDate).map(([date, dateSessions]) => {
        const totalStudyTime = dateSessions
          .filter(s => s.type === 'study')
          .reduce((total, session) => total + session.duration, 0);
          
        const totalBreakTime = dateSessions
          .filter(s => s.type === 'break')
          .reduce((total, session) => total + session.duration, 0);
          
        const completedSessions = dateSessions.filter(s => s.completed).length;
        const incompleteSessions = dateSessions.filter(s => !s.completed).length;
        
        const formattedDate = new Date(date).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return {
          date,
          formattedDate,
          totalStudyTime,
          totalBreakTime,
          completedSessions,
          incompleteSessions
        };
      });
      
      // Sort by date (newest first)
      dailyReports.sort((a, b) => b.date.localeCompare(a.date));
      
      setReports(dailyReports);
      
      // If there are reports, select the most recent by default
      if (dailyReports.length > 0) {
        setSelectedDate(dailyReports[0].date);
        setSessions(groupedByDate[dailyReports[0].date]);
      }
    } catch (e) {
      console.error('Failed to load session data', e);
    }
  }, []);
  
  // When selected date changes, update sessions list
  useEffect(() => {
    if (!selectedDate) return;
    
    try {
      const sessionsData = JSON.parse(localStorage.getItem('studySessionsData') || '[]') as SessionData[];
      const dateSessionsData = sessionsData.filter(session => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === selectedDate;
      });
      
      // Sort by date (newest first)
      dateSessionsData.sort((a, b) => b.id - a.id);
      
      setSessions(dateSessionsData);
    } catch (e) {
      console.error('Failed to load sessions for date', e);
    }
  }, [selectedDate]);
  
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all study session history? This cannot be undone.')) {
      localStorage.removeItem('studySessionsData');
      setReports([]);
      setSessions([]);
      setSelectedDate(null);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Sessions Report</h1>
        <Link href="/">
          <Button variant="outline">Back to Timer</Button>
        </Link>
      </div>
      
      {reports.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl mb-4">No Study Sessions Yet</h2>
          <p className="mb-4">Start a study session to track your progress.</p>
          <Link href="/">
            <Button>Start Studying</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Daily Summary</h2>
            <div className="space-y-3">
              {reports.map(report => (
                <Card 
                  key={report.date}
                  className={`p-4 cursor-pointer ${selectedDate === report.date ? 'border-primary' : ''}`}
                  onClick={() => setSelectedDate(report.date)}
                >
                  <h3 className="font-medium">{report.formattedDate}</h3>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Study Time:</span>
                      <span className="font-medium">{formatTime(report.totalStudyTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break Time:</span>
                      <span className="font-medium">{formatTime(report.totalBreakTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Sessions:</span>
                      <span className="font-medium">{report.completedSessions}</span>
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="destructive" size="sm" onClick={clearAllData} className="w-full mt-4">
                Clear All Data
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Session Details</h2>
            {selectedDate && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map(session => (
                  <Card key={session.id} className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          session.type === 'study' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {session.type === 'study' ? 'Study' : 'Break'}
                        </span>
                        <span className={`ml-2 text-xs ${session.completed ? 'text-green-600' : 'text-amber-600'}`}>
                          {session.completed ? 'Completed' : 'Incomplete'}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-500">
                        {new Date(session.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{formatTime(session.duration)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p>Select a day to view session details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}