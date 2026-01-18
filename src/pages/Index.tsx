import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/f6160b71-ab85-440c-8039-c830d68ae9bb';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [news, setNews] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, newsRes, matchesRes, playersRes, galleryRes] = await Promise.all([
        fetch(`${API_URL}?type=settings`),
        fetch(`${API_URL}?type=news`),
        fetch(`${API_URL}?type=matches`),
        fetch(`${API_URL}?type=players`),
        fetch(`${API_URL}?type=gallery`)
      ]);
      
      setSettings(await settingsRes.json());
      setNews(await newsRes.json());
      setMatches(await matchesRes.json());
      setPlayers(await playersRes.json());
      setGallery(await galleryRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'news', label: 'Новости', icon: 'Newspaper' },
    { id: 'calendar', label: 'Календарь', icon: 'Calendar' },
    { id: 'team', label: 'Состав', icon: 'Users' },
    { id: 'history', label: 'История', icon: 'BookOpen' },
    { id: 'gallery', label: 'Галерея', icon: 'Image' },
    { id: 'contacts', label: 'Контакты', icon: 'Phone' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-primary/95 backdrop-blur-sm shadow-lg' : 'bg-primary'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <img src={settings.logo_url || 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/7932246c-7bb3-4c22-8c49-3f970ee4c11d.jpg'} alt="Торос" className="h-14 w-14 rounded-full object-cover" />
              <span className="text-2xl font-bold text-white">{settings.site_title || 'ТОРОС'}</span>
            </div>
            <div className="hidden md:flex space-x-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'secondary' : 'ghost'}
                  className={activeSection === item.id ? 'text-white' : 'text-white hover:text-white hover:bg-white/10'}
                  onClick={() => scrollToSection(item.id)}
                >
                  <Icon name={item.icon as any} size={18} className="mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="hidden md:block" onClick={() => window.location.href = '/admin'}>
              <Icon name="User" size={18} className="mr-2" />
              Админ-панель
            </Button>
          </div>
        </div>
      </nav>

      <section id="home" className="relative pt-20 min-h-screen flex items-center bg-gradient-to-br from-primary via-primary/95 to-primary/80 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                {settings.hero_title || 'ХК ТОРОС'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {settings.hero_subtitle || 'Нефтекамск • ВХЛ • Сезон 2025/2026'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" onClick={() => scrollToSection('calendar')}>
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Календарь матчей
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" onClick={() => scrollToSection('news')}>
                  <Icon name="Newspaper" size={20} className="mr-2" />
                  Последние новости
                </Button>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <img src={settings.hero_image || 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'} alt="Хоккей" className="rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{settings.news_title || 'Новости'}</h2>
            <p className="text-muted-foreground text-lg">{settings.news_subtitle || 'Последние события и анонсы'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((item, index) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <Badge className="mb-3">{item.category}</Badge>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{new Date(item.published_date).toLocaleDateString('ru-RU')}</p>
                  <Button variant="link" className="px-0">
                    Читать далее <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Посмотреть все новости
            </Button>
          </div>
        </div>
      </section>

      <section id="calendar" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{settings.calendar_title || 'Календарь матчей'}</h2>
            <p className="text-muted-foreground text-lg">{settings.calendar_subtitle || 'Расписание игр и результаты'}</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {matches.slice(0, 5).map((match, index) => (
              <Card key={match.id} className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{match.match_date}</p>
                    <p className="text-sm text-muted-foreground">{match.match_time}</p>
                  </div>
                  <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-xl font-bold">{match.home_team}</span>
                      {match.home_logo && <img src={match.home_logo} alt={match.home_team} className="w-12 h-12 rounded-full object-cover" />}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {match.score || 'VS'}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      {match.away_logo ? <img src={match.away_logo} alt={match.away_team} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Icon name="Shield" size={24} /></div>}
                      <span className="text-xl font-bold">{match.away_team}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <Icon name="MapPin" size={16} className="inline mr-1" />
                    <span className="text-sm">{match.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="secondary" size="lg">
              <Icon name="Calendar" size={20} className="mr-2" />
              Посмотреть календарь матчей
            </Button>
          </div>
        </div>
      </section>

      <section id="team" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{settings.team_title || 'Состав команды'}</h2>
            <p className="text-muted-foreground text-lg">{settings.team_subtitle || 'Наши игроки'}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {players.slice(0, 6).map((player, index) => (
              <Card key={player.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative">
                  {player.image_url && <img src={player.image_url} alt={player.name} className="w-full h-64 object-cover" />}
                  <div className="absolute top-4 left-4 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                    {player.number}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                  <p className="text-muted-foreground">{player.position}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Полный состав команды
            </Button>
          </div>
        </div>
      </section>

      <section id="history" className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">{settings.history_title || 'История клуба'}</h2>
              <p className="text-white/80 text-lg">{settings.history_subtitle || 'Путь к успеху'}</p>
            </div>
            <div className="space-y-8">
              <Card className="p-8 bg-white/10 border-white/20 text-white animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-full">
                    <Icon name="Trophy" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{settings.history_block1_title || 'Основание клуба'}</h3>
                    <p className="text-white/80">{settings.history_block1_text || 'Хоккейный клуб "Торос" основан в Нефтекамске'}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-8 bg-white/10 border-white/20 text-white animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-full">
                    <Icon name="Star" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{settings.history_block2_title || 'Достижения'}</h3>
                    <p className="text-white/80">{settings.history_block2_text || 'Команда успешно выступает в ВХЛ'}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-8 bg-white/10 border-white/20 text-white animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-full">
                    <Icon name="Heart" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{settings.history_block3_title || 'Наши болельщики'}</h3>
                    <p className="text-white/80">{settings.history_block3_text || 'Преданные фанаты "Тороса"'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{settings.gallery_title || 'Галерея'}</h2>
            <p className="text-muted-foreground text-lg">{settings.gallery_subtitle || 'Лучшие моменты'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {gallery.slice(0, 6).map((item, index) => (
              <div key={item.id} className="relative overflow-hidden rounded-lg group cursor-pointer animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <img src={item.image_url} alt={item.title || `Галерея ${index + 1}`} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Icon name="ZoomIn" size={40} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{settings.contacts_title || 'Контакты'}</h2>
            <p className="text-muted-foreground text-lg">{settings.contacts_subtitle || 'Свяжитесь с нами'}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <Icon name="Phone" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Приемная клуба</h3>
                    <p className="text-muted-foreground">{settings.contact_phone || '+7 (34783) 5 54 23'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-secondary text-white p-3 rounded-full">
                    <Icon name="Mail" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Email</h3>
                    <p className="text-muted-foreground">{settings.contact_email || 'reklama@hctoros.ru'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-white p-3 rounded-full">
                    <Icon name="MapPin" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Адрес</h3>
                    <p className="text-muted-foreground">{settings.contact_address || 'Нефтекамск, Республика Башкортостан'}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h3 className="text-xl font-bold mb-6">Обратная связь</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Имя</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ваше имя" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Сообщение</label>
                    <textarea className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32" placeholder="Ваше сообщение"></textarea>
                  </div>
                  <Button className="w-full" size="lg">
                    Отправить
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={settings.logo_url || 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/7932246c-7bb3-4c22-8c49-3f970ee4c11d.jpg'} alt="Торос" className="h-12 w-12 rounded-full object-cover" />
                <span className="text-2xl font-bold">{settings.site_title || 'ТОРОС'}</span>
              </div>
              <p className="text-white/80">{settings.hero_subtitle || 'Хоккейный клуб города Нефтекамск'}</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Быстрые ссылки</h4>
              <ul className="space-y-2">
                {menuItems.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <button onClick={() => scrollToSection(item.id)} className="text-white/80 hover:text-white transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Партнеры</h4>
              <p className="text-white/80">OLIMPBET - Чемпионата России по хоккею ВХЛ сезона 2025/2026</p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>© Хоккейный клуб «Торос» (Нефтекамск)</p>
            <p className="mt-2">Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;