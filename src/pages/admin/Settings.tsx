import { useState } from 'react';
import { User, Globe, Home, Link2, Search, Tags, UserCircle, FolderOpen, LayoutGrid, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import SettingsProfile from './settings/SettingsProfile';
import SettingsSite from './settings/SettingsSite';
import SettingsHomepage from './settings/SettingsHomepage';
import SettingsLinkhub from './settings/SettingsLinkhub';
import SettingsAbout from './settings/SettingsAbout';
import SettingsProjects from './settings/SettingsProjects';
import SettingsPlatforms from './settings/SettingsPlatforms';
import SettingsSEO from './settings/SettingsSEO';
import SettingsCategories from './settings/SettingsCategories';

const tabs = [
  { id: 'profile', label: 'Профиль', Icon: User },
  { id: 'linkhub', label: 'Линк-хаб (/)', Icon: LayoutGrid },
  { id: 'homepage', label: 'Блог-главная', Icon: BookOpen },
  { id: 'about', label: 'Обо мне', Icon: UserCircle },
  { id: 'projects', label: 'Проекты', Icon: FolderOpen },
  { id: 'categories', label: 'Категории', Icon: Tags },
  { id: 'site', label: 'Сайт', Icon: Globe },
  { id: 'platforms', label: 'Платформы', Icon: Link2 },
  { id: 'seo', label: 'SEO', Icon: Search },
] as const;

type TabId = typeof tabs[number]['id'];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <SettingsProfile />;
      case 'linkhub': return <SettingsLinkhub />;
      case 'homepage': return <SettingsHomepage />;
      case 'about': return <SettingsAbout />;
      case 'projects': return <SettingsProjects />;
      case 'categories': return <SettingsCategories />;
      case 'site': return <SettingsSite />;
      case 'platforms': return <SettingsPlatforms />;
      case 'seo': return <SettingsSEO />;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left tab nav */}
      <nav className="w-[180px] shrink-0 sticky top-6 self-start space-y-1">
        <h1 className="text-lg font-bold mb-4">Настройки</h1>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
              activeTab === tab.id
                ? 'bg-secondary text-foreground font-medium border-l-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right content */}
      <div className="flex-1 min-w-0 max-w-3xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminSettings;
