import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { useVault, PasswordEntry } from '@/lib/vaultContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, Lock, Search, Plus, Eye, EyeOff, Copy, Edit2, Trash2, 
  ExternalLink, LogOut, CheckCircle2, Globe, CreditCard, ShoppingBag,
  Briefcase, Film, Users, MoreHorizontal, Key, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: Record<string, React.ReactNode> = {
  'Social': <Users className="w-4 h-4" />,
  'Work': <Briefcase className="w-4 h-4" />,
  'Finance': <CreditCard className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Other': <Globe className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  'Social': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Work': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Finance': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Shopping': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Entertainment': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Other': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function generatePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function PasswordCard({ entry, onEdit, onDelete }: { 
  entry: PasswordEntry; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'password' | 'username' | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'password' | 'username') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      description: `${type === 'password' ? 'Password' : 'Username'} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group glass rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-200"
      data-testid={`card-password-${entry.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg border ${categoryColors[entry.category]}`}>
            {categoryIcons[entry.category]}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate" data-testid={`text-service-${entry.id}`}>
              {entry.service}
            </h3>
            <p className="text-sm text-muted-foreground truncate" data-testid={`text-username-${entry.id}`}>
              {entry.username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {entry.url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => window.open(entry.url, '_blank')}
              data-testid={`button-open-url-${entry.id}`}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            data-testid={`button-edit-${entry.id}`}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            data-testid={`button-delete-${entry.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
            <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-mono text-sm flex-1 truncate" data-testid={`text-password-${entry.id}`}>
              {showPassword ? entry.password : '••••••••••••'}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`button-toggle-password-${entry.id}`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => copyToClipboard(entry.password, 'password')}
          data-testid={`button-copy-password-${entry.id}`}
        >
          {copied === 'password' ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => copyToClipboard(entry.username, 'username')}
          data-testid={`button-copy-username-${entry.id}`}
        >
          {copied === 'username' ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Users className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function Vault() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isVaultUnlocked, lockVault, logout } = useAuth();
  const { passwords, addPassword, updatePassword, deletePassword, searchPasswords, categories } = useVault();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'Other'
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (!isVaultUnlocked) {
      setLocation('/unlock');
    }
  }, [isAuthenticated, isVaultUnlocked, setLocation]);

  const filteredPasswords = searchPasswords(searchQuery).filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  );

  const handleLock = () => {
    lockVault();
    setLocation('/unlock');
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const resetForm = () => {
    setFormData({
      service: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: 'Other'
    });
    setShowFormPassword(false);
  };

  const handleAdd = () => {
    resetForm();
    setEditingEntry(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (entry: PasswordEntry) => {
    setFormData({
      service: entry.service,
      username: entry.username,
      password: entry.password,
      url: entry.url || '',
      notes: entry.notes || '',
      category: entry.category
    });
    setEditingEntry(entry);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.service || !formData.username || !formData.password) {
      toast({
        variant: 'destructive',
        description: 'Please fill in all required fields'
      });
      return;
    }

    if (editingEntry) {
      updatePassword(editingEntry.id, formData);
      toast({ description: 'Password updated successfully' });
    } else {
      addPassword(formData);
      toast({ description: 'Password added successfully' });
    }

    setIsAddDialogOpen(false);
    resetForm();
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    deletePassword(id);
    setDeleteConfirm(null);
    toast({ description: 'Password deleted' });
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16);
    setFormData({ ...formData, password: newPassword });
    setShowFormPassword(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg gradient-text" data-testid="text-logo">
              VaultKey
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block" data-testid="text-user-email">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLock}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-lock"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border/50"
              data-testid="input-search"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40 h-11" data-testid="select-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAdd} className="h-11 glow-sm" data-testid="button-add-password">
            <Plus className="w-4 h-4 mr-2" />
            Add Password
          </Button>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filteredPasswords.length > 0 ? (
              filteredPasswords.map(entry => (
                <PasswordCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => handleEdit(entry)}
                  onDelete={() => setDeleteConfirm(entry.id)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                  <Key className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1" data-testid="text-empty-title">
                  {searchQuery ? 'No passwords found' : 'Your vault is empty'}
                </h3>
                <p className="text-muted-foreground text-sm" data-testid="text-empty-description">
                  {searchQuery ? 'Try a different search term' : 'Add your first password to get started'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground" data-testid="text-password-count">
          {passwords.length} password{passwords.length !== 1 ? 's' : ''} stored
        </div>
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingEntry ? 'Edit Password' : 'Add New Password'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update your saved password details' : 'Save a new password to your vault'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service Name *</Label>
              <Input
                id="service"
                placeholder="e.g., Google, Netflix"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="bg-background/50"
                data-testid="input-form-service"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username / Email *</Label>
              <Input
                id="username"
                placeholder="your@email.com"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-background/50"
                data-testid="input-form-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-password">Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="form-password"
                    type={showFormPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-background/50 pr-10"
                    data-testid="input-form-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-form-toggle-password"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  data-testid="button-generate-password"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-background/50"
                data-testid="input-form-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-form-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background/50 resize-none"
                rows={3}
                data-testid="input-form-notes"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                  setEditingEntry(null);
                }}
                data-testid="button-form-cancel"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 glow-sm" 
                onClick={handleSave}
                data-testid="button-form-save"
              >
                {editingEntry ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this password? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
              data-testid="button-delete-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              data-testid="button-delete-confirm"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}