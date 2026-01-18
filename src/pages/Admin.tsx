import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/f6160b71-ab85-440c-8039-c830d68ae9bb';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [news, setNews] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  const [editDialog, setEditDialog] = useState(false);
  const [editType, setEditType] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token: tokenToVerify })
      });
      const data = await response.json();
      if (data.valid) {
        setToken(tokenToVerify);
        setIsLoggedIn(true);
        loadAllData();
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setIsLoggedIn(true);
        localStorage.setItem('admin_token', data.token);
        loadAllData();
        toast({ title: 'Успешный вход', description: `Добро пожаловать, ${data.username}!` });
      } else {
        toast({ title: 'Ошибка', description: 'Неверный логин или пароль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось войти', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    localStorage.removeItem('admin_token');
  };

  const loadAllData = async () => {
    try {
      const [newsRes, matchesRes, playersRes, galleryRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}?type=news`),
        fetch(`${API_URL}?type=matches`),
        fetch(`${API_URL}?type=players`),
        fetch(`${API_URL}?type=gallery`),
        fetch(`${API_URL}?type=settings`)
      ]);
      
      setNews(await newsRes.json());
      setMatches(await matchesRes.json());
      setPlayers(await playersRes.json());
      setGallery(await galleryRes.json());
      setSettings(await settingsRes.json());
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные', variant: 'destructive' });
    }
  };

  const handleEdit = (type: string, item: any = null) => {
    setEditType(type);
    setEditItem(item || {});
    setEditDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (editItem?.id) {
        await fetch(`${API_URL}?type=${editType}&id=${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        toast({ title: 'Успешно', description: 'Изменения сохранены' });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', type: editType, ...data })
        });
        toast({ title: 'Успешно', description: 'Элемент создан' });
      }
      setEditDialog(false);
      loadAllData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Вы уверены?')) return;
    
    try {
      await fetch(`${API_URL}?type=${type}&id=${id}`, { method: 'DELETE' });
      toast({ title: 'Успешно', description: 'Элемент удалён' });
      loadAllData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/80">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">ХК ТОРОС</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="dmitri1987"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Админ-панель ХК ТОРОС</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary" onClick={() => window.location.href = '/'}>
              <Icon name="Home" size={18} className="mr-2" />
              На сайт
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="news">Новости</TabsTrigger>
            <TabsTrigger value="matches">Матчи</TabsTrigger>
            <TabsTrigger value="players">Игроки</TabsTrigger>
            <TabsTrigger value="gallery">Галерея</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Новости</h2>
              <Button onClick={() => handleEdit('news')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить новость
              </Button>
            </div>
            <div className="grid gap-4">
              {news.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.category} • {new Date(item.published_date).toLocaleDateString()}</p>
                      <p className="mt-2">{item.content?.substring(0, 150)}...</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit('news', item)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete('news', item.id)}>
                        <Icon name="Trash" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Матчи</h2>
              <Button onClick={() => handleEdit('matches')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить матч
              </Button>
            </div>
            <div className="grid gap-4">
              {matches.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-bold">{item.match_date}</p>
                          <p className="text-sm text-muted-foreground">{item.match_time}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{item.home_team}</span>
                          <span className="text-xl font-bold text-primary">{item.score || 'VS'}</span>
                          <span className="font-bold">{item.away_team}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">📍 {item.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit('matches', item)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete('matches', item.id)}>
                        <Icon name="Trash" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Игроки</h2>
              <Button onClick={() => handleEdit('players')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить игрока
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">#{item.number}</span>
                        <span className="font-bold">{item.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.position}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit('players', item)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete('players', item.id)}>
                        <Icon name="Trash" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Галерея</h2>
              <Button onClick={() => handleEdit('gallery')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить фото
              </Button>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-3">
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit('gallery', item)}>
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete('gallery', item.id)}>
                        <Icon name="Trash" size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Настройки сайта</h2>
            <Card className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(formData.entries());
                try {
                  await fetch(`${API_URL}?type=settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  toast({ title: 'Успешно', description: 'Настройки сохранены' });
                  loadAllData();
                } catch (error) {
                  toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
                }
              }} className="space-y-4">
                <div>
                  <Label htmlFor="site_title">Название сайта</Label>
                  <Input id="site_title" name="site_title" defaultValue={settings.site_title} />
                </div>
                <div>
                  <Label htmlFor="site_subtitle">Подзаголовок</Label>
                  <Input id="site_subtitle" name="site_subtitle" defaultValue={settings.site_subtitle} />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Телефон</Label>
                  <Input id="contact_phone" name="contact_phone" defaultValue={settings.contact_phone} />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" name="contact_email" defaultValue={settings.contact_email} />
                </div>
                <div>
                  <Label htmlFor="contact_address">Адрес</Label>
                  <Input id="contact_address" name="contact_address" defaultValue={settings.contact_address} />
                </div>
                <Button type="submit">Сохранить настройки</Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem?.id ? 'Редактировать' : 'Добавить'} {
                editType === 'news' ? 'новость' :
                editType === 'matches' ? 'матч' :
                editType === 'players' ? 'игрока' :
                'фото'
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {editType === 'news' && (
              <>
                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input id="title" name="title" defaultValue={editItem?.title} required />
                </div>
                <div>
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea id="content" name="content" defaultValue={editItem?.content} rows={5} required />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input id="category" name="category" defaultValue={editItem?.category} required />
                </div>
                <div>
                  <Label htmlFor="image_url">URL изображения</Label>
                  <Input id="image_url" name="image_url" defaultValue={editItem?.image_url} />
                </div>
              </>
            )}
            
            {editType === 'matches' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="match_date">Дата</Label>
                    <Input id="match_date" name="match_date" defaultValue={editItem?.match_date} required />
                  </div>
                  <div>
                    <Label htmlFor="match_time">Время</Label>
                    <Input id="match_time" name="match_time" defaultValue={editItem?.match_time} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="home_team">Хозяева</Label>
                    <Input id="home_team" name="home_team" defaultValue={editItem?.home_team} required />
                  </div>
                  <div>
                    <Label htmlFor="away_team">Гости</Label>
                    <Input id="away_team" name="away_team" defaultValue={editItem?.away_team} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="score">Счёт (опционально)</Label>
                  <Input id="score" name="score" defaultValue={editItem?.score} placeholder="3:2" />
                </div>
                <div>
                  <Label htmlFor="location">Место проведения</Label>
                  <Input id="location" name="location" defaultValue={editItem?.location} required />
                </div>
                <div>
                  <Label htmlFor="home_logo">Логотип хозяев (URL)</Label>
                  <Input id="home_logo" name="home_logo" defaultValue={editItem?.home_logo} />
                </div>
              </>
            )}
            
            {editType === 'players' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">Номер</Label>
                    <Input id="number" name="number" type="number" defaultValue={editItem?.number} required />
                  </div>
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input id="name" name="name" defaultValue={editItem?.name} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Позиция</Label>
                  <Input id="position" name="position" defaultValue={editItem?.position} required />
                </div>
                <div>
                  <Label htmlFor="image_url">URL фото</Label>
                  <Input id="image_url" name="image_url" defaultValue={editItem?.image_url} />
                </div>
                <div>
                  <Label htmlFor="bio">Биография (опционально)</Label>
                  <Textarea id="bio" name="bio" defaultValue={editItem?.bio} rows={3} />
                </div>
              </>
            )}
            
            {editType === 'gallery' && (
              <>
                <div>
                  <Label htmlFor="image_url">URL изображения</Label>
                  <Input id="image_url" name="image_url" defaultValue={editItem?.image_url} required />
                </div>
                <div>
                  <Label htmlFor="title">Название (опционально)</Label>
                  <Input id="title" name="title" defaultValue={editItem?.title} />
                </div>
                <div>
                  <Label htmlFor="description">Описание (опционально)</Label>
                  <Textarea id="description" name="description" defaultValue={editItem?.description} rows={3} />
                </div>
              </>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Сохранить</Button>
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>Отмена</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
