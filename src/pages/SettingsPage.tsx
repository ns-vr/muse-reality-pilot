const SettingsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Settings</h1>
      <div className="glass-panel p-6 rounded-xl max-w-2xl">
        <h3 className="font-heading font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <span className="text-sm">Camera Quality</span>
            <span className="text-sm text-muted-foreground">HD (720p)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <span className="text-sm">Voice Narration Language</span>
            <span className="text-sm text-muted-foreground">English</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm">Auto-save Recordings</span>
            <span className="text-sm text-muted-foreground">Off</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
