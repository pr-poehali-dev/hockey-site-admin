import json
import os
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import jwt

def handler(event: dict, context) -> dict:
    '''Система авторизации администраторов и управления контентом (news, matches, players, gallery)'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            path_params = event.get('queryStringParameters') or {}
            entity_type = path_params.get('type', '')
            entity_id = path_params.get('id', '')
            
            if entity_type == 'news':
                if entity_id:
                    cur.execute("SELECT * FROM news WHERE id = %s", (entity_id,))
                    item = cur.fetchone()
                    result = dict(item) if item else None
                else:
                    cur.execute("SELECT * FROM news ORDER BY published_date DESC")
                    items = cur.fetchall()
                    result = [dict(item) for item in items]
            
            elif entity_type == 'matches':
                if entity_id:
                    cur.execute("SELECT * FROM matches WHERE id = %s", (entity_id,))
                    item = cur.fetchone()
                    result = dict(item) if item else None
                else:
                    cur.execute("SELECT * FROM matches ORDER BY created_at DESC")
                    items = cur.fetchall()
                    result = [dict(item) for item in items]
            
            elif entity_type == 'players':
                if entity_id:
                    cur.execute("SELECT * FROM players WHERE id = %s", (entity_id,))
                    item = cur.fetchone()
                    result = dict(item) if item else None
                else:
                    cur.execute("SELECT * FROM players ORDER BY number")
                    items = cur.fetchall()
                    result = [dict(item) for item in items]
            
            elif entity_type == 'gallery':
                if entity_id:
                    cur.execute("SELECT * FROM gallery WHERE id = %s", (entity_id,))
                    item = cur.fetchone()
                    result = dict(item) if item else None
                else:
                    cur.execute("SELECT * FROM gallery ORDER BY created_at DESC")
                    items = cur.fetchall()
                    result = [dict(item) for item in items]
            
            elif entity_type == 'settings':
                cur.execute("SELECT * FROM site_settings")
                items = cur.fetchall()
                result = {item['setting_key']: item['setting_value'] for item in items}
            
            else:
                result = {'error': 'Invalid entity type'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'login')
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            if action == 'login':
                username = body.get('username', '')
                password = body.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Username and password required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT id, username, password_hash FROM admins WHERE username = %s", (username,))
                admin = cur.fetchone()
                
                if not admin:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                admin_id, db_username, password_hash = admin
                
                if password_hash == '$2b$10$YourHashHere':
                    new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute("UPDATE admins SET password_hash = %s WHERE id = %s", (new_hash, admin_id))
                    conn.commit()
                    password_hash = new_hash
                
                if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                secret_key = os.environ.get('JWT_SECRET', 'hockey-toros-secret-key-2026')
                token = jwt.encode({
                    'admin_id': admin_id,
                    'username': db_username,
                    'exp': datetime.utcnow() + timedelta(days=7)
                }, secret_key, algorithm='HS256')
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'token': token,
                        'username': db_username
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify':
                token = body.get('token', '')
                
                if not token:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Token required'}),
                        'isBase64Encoded': False
                    }
                
                try:
                    secret_key = os.environ.get('JWT_SECRET', 'hockey-toros-secret-key-2026')
                    payload = jwt.decode(token, secret_key, algorithms=['HS256'])
                    
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'valid': True,
                            'username': payload.get('username')
                        }),
                        'isBase64Encoded': False
                    }
                except jwt.ExpiredSignatureError:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Token expired'}),
                        'isBase64Encoded': False
                    }
                except jwt.InvalidTokenError:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Invalid token'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'create':
                entity_type = body.get('type', '')
                
                if entity_type == 'news':
                    cur.execute(
                        "INSERT INTO news (title, content, category, image_url) VALUES (%s, %s, %s, %s) RETURNING id",
                        (body.get('title'), body.get('content'), body.get('category'), body.get('image_url'))
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                    result = {'id': new_id, 'message': 'News created'}
                
                elif entity_type == 'matches':
                    cur.execute(
                        "INSERT INTO matches (match_date, match_time, home_team, away_team, home_logo, away_logo, score, location) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                        (body.get('match_date'), body.get('match_time'), body.get('home_team'), body.get('away_team'), 
                         body.get('home_logo'), body.get('away_logo'), body.get('score'), body.get('location'))
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                    result = {'id': new_id, 'message': 'Match created'}
                
                elif entity_type == 'players':
                    cur.execute(
                        "INSERT INTO players (number, name, position, image_url, bio) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (body.get('number'), body.get('name'), body.get('position'), body.get('image_url'), body.get('bio'))
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                    result = {'id': new_id, 'message': 'Player created'}
                
                elif entity_type == 'gallery':
                    cur.execute(
                        "INSERT INTO gallery (image_url, title, description) VALUES (%s, %s, %s) RETURNING id",
                        (body.get('image_url'), body.get('title'), body.get('description'))
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                    result = {'id': new_id, 'message': 'Gallery item created'}
                
                else:
                    result = {'error': 'Invalid entity type'}
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        try:
            body = json.loads(event.get('body', '{}'))
            path_params = event.get('queryStringParameters') or {}
            entity_type = path_params.get('type', '')
            entity_id = path_params.get('id', '')
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            if entity_type == 'news' and entity_id:
                cur.execute(
                    "UPDATE news SET title = %s, content = %s, category = %s, image_url = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (body.get('title'), body.get('content'), body.get('category'), body.get('image_url'), entity_id)
                )
                conn.commit()
                result = {'message': 'News updated'}
            
            elif entity_type == 'matches' and entity_id:
                cur.execute(
                    "UPDATE matches SET match_date = %s, match_time = %s, home_team = %s, away_team = %s, home_logo = %s, away_logo = %s, score = %s, location = %s WHERE id = %s",
                    (body.get('match_date'), body.get('match_time'), body.get('home_team'), body.get('away_team'),
                     body.get('home_logo'), body.get('away_logo'), body.get('score'), body.get('location'), entity_id)
                )
                conn.commit()
                result = {'message': 'Match updated'}
            
            elif entity_type == 'players' and entity_id:
                cur.execute(
                    "UPDATE players SET number = %s, name = %s, position = %s, image_url = %s, bio = %s WHERE id = %s",
                    (body.get('number'), body.get('name'), body.get('position'), body.get('image_url'), body.get('bio'), entity_id)
                )
                conn.commit()
                result = {'message': 'Player updated'}
            
            elif entity_type == 'settings':
                for key, value in body.items():
                    cur.execute(
                        "INSERT INTO site_settings (setting_key, setting_value) VALUES (%s, %s) ON CONFLICT (setting_key) DO UPDATE SET setting_value = %s, updated_at = CURRENT_TIMESTAMP",
                        (key, value, value)
                    )
                conn.commit()
                result = {'message': 'Settings updated'}
            
            else:
                result = {'error': 'Invalid entity type or missing ID'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    elif method == 'DELETE':
        try:
            path_params = event.get('queryStringParameters') or {}
            entity_type = path_params.get('type', '')
            entity_id = path_params.get('id', '')
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            if entity_type == 'news' and entity_id:
                cur.execute("DELETE FROM news WHERE id = %s", (entity_id,))
                conn.commit()
                result = {'message': 'News deleted'}
            
            elif entity_type == 'matches' and entity_id:
                cur.execute("DELETE FROM matches WHERE id = %s", (entity_id,))
                conn.commit()
                result = {'message': 'Match deleted'}
            
            elif entity_type == 'players' and entity_id:
                cur.execute("DELETE FROM players WHERE id = %s", (entity_id,))
                conn.commit()
                result = {'message': 'Player deleted'}
            
            elif entity_type == 'gallery' and entity_id:
                cur.execute("DELETE FROM gallery WHERE id = %s", (entity_id,))
                conn.commit()
                result = {'message': 'Gallery item deleted'}
            
            else:
                result = {'error': 'Invalid entity type or missing ID'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }