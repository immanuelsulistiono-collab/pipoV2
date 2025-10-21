import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JournalEntry, Goal } from '@/types/database';
import { format } from 'date-fns';
import { Plus, LogOut, BookOpen, Target } from 'lucide-react';

export function Dashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryMood, setEntryMood] = useState('neutral');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  useEffect(() => {
    loadUser();
    loadEntries();
    loadGoals();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('journal_entries').insert({
        user_id: user?.id,
        title: entryTitle,
        content: entryContent,
        mood: entryMood,
      });

      if (error) throw error;

      setEntryTitle('');
      setEntryContent('');
      setEntryMood('neutral');
      setShowNewEntry(false);
      loadEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user?.id,
        title: goalTitle,
        description: goalDescription,
        target_date: goalTargetDate || null,
      });

      if (error) throw error;

      setGoalTitle('');
      setGoalDescription('');
      setGoalTargetDate('');
      setShowNewGoal(false);
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">PipoJournal</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="journal" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="journal">
              <BookOpen className="mr-2 h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="mr-2 h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900">My Journal</h2>
              <Button onClick={() => setShowNewEntry(!showNewEntry)}>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </div>

            {showNewEntry && (
              <Card>
                <CardHeader>
                  <CardTitle>New Journal Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEntry} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={entryTitle}
                        onChange={(e) => setEntryTitle(e.target.value)}
                        placeholder="What's on your mind?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">How are you feeling?</label>
                      <div className="flex gap-2">
                        {moods.map((mood) => (
                          <button
                            key={mood.value}
                            type="button"
                            onClick={() => setEntryMood(mood.value)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              entryMood === mood.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-2xl">{mood.emoji}</span>
                            <div className="text-xs mt-1">{mood.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="Write your thoughts..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Entry</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewEntry(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {entries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">No journal entries yet. Start writing!</p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{entry.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(entry.created_at), 'MMMM d, yyyy • h:mm a')}
                          </CardDescription>
                        </div>
                        <div className="text-2xl">
                          {moods.find((m) => m.value === entry.mood)?.emoji || '😐'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900">My Goals</h2>
              <Button onClick={() => setShowNewGoal(!showNewGoal)}>
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </div>

            {showNewGoal && (
              <Card>
                <CardHeader>
                  <CardTitle>New Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="What do you want to achieve?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Describe your goal..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Date</label>
                      <Input
                        type="date"
                        value={goalTargetDate}
                        onChange={(e) => setGoalTargetDate(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Create Goal</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewGoal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {goals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">No goals yet. Set your first goal!</p>
                  </CardContent>
                </Card>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle>{goal.title}</CardTitle>
                      <CardDescription>
                        {goal.target_date
                          ? `Target: ${format(new Date(goal.target_date), 'MMMM d, yyyy')}`
                          : 'No target date set'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{goal.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {goal.progress}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
