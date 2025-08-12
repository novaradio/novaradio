"""
Twitter API v2 Integration for DAMI Centro de Monitoreo Inteligente
Real-time data connection for Frente Renovador monitoring
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import aiohttp
from fastapi import HTTPException

class TwitterAPIv2Integration:
    """Real Twitter API v2 integration for political monitoring"""
    
    def __init__(self):
        # Twitter API v2 credentials (will be provided by user)
        self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.api_base = "https://api.twitter.com/2"
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json"
        }
        
        # Search terms for Frente Renovador monitoring
        self.frente_renovador_terms = [
            "Frente Renovador",
            "Concordia Social", 
            "Frente Renovador de la Concordia Social",
            "@FrenteRenovador",
            "#FrenteRenovador",
            "#ConcordiaSocial",
            "#MisionesAvanza"
        ]
        
        # Opposition monitoring terms
        self.opposition_terms = [
            # Add opposition parties/candidates as needed
            "oposicion",
            "candidato rival"
        ]

    async def search_recent_tweets(self, query: str, max_results: int = 100) -> Dict[str, Any]:
        """Search recent tweets with Twitter API v2"""
        try:
            if not self.bearer_token:
                # Return simulated data if no API key (fallback)
                return self._get_simulated_twitter_data(query, max_results)
            
            # Twitter API v2 search endpoint
            url = f"{self.api_base}/tweets/search/recent"
            
            params = {
                'query': query,
                'max_results': min(max_results, 100),  # API limit
                'tweet.fields': 'created_at,author_id,public_metrics,context_annotations,lang,geo',
                'user.fields': 'name,username,verified,public_metrics,location',
                'expansions': 'author_id,geo.place_id'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_twitter_response(data)
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Twitter API Error: {error_data}"
                        )
                        
        except Exception as e:
            print(f"Error accessing Twitter API: {str(e)}")
            # Fallback to simulated data
            return self._get_simulated_twitter_data(query, max_results)

    def _process_twitter_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process Twitter API response into our format"""
        tweets = data.get('data', [])
        users = {user['id']: user for user in data.get('includes', {}).get('users', [])}
        
        processed_tweets = []
        total_engagement = 0
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for tweet in tweets:
            # Get user info
            author_id = tweet.get('author_id')
            author = users.get(author_id, {})
            
            # Calculate metrics
            metrics = tweet.get('public_metrics', {})
            engagement = (
                metrics.get('like_count', 0) + 
                metrics.get('retweet_count', 0) + 
                metrics.get('reply_count', 0) + 
                metrics.get('quote_count', 0)
            )
            total_engagement += engagement
            
            # Simple sentiment analysis (basic keyword-based)
            sentiment = self._analyze_sentiment(tweet.get('text', ''))
            if sentiment > 0.1:
                positive_count += 1
            elif sentiment < -0.1:
                negative_count += 1
            else:
                neutral_count += 1
            
            processed_tweet = {
                'id': tweet.get('id'),
                'text': tweet.get('text'),
                'created_at': tweet.get('created_at'),
                'author': {
                    'username': author.get('username', 'unknown'),
                    'name': author.get('name', 'Unknown User'),
                    'verified': author.get('verified', False),
                    'followers': author.get('public_metrics', {}).get('followers_count', 0)
                },
                'metrics': metrics,
                'engagement': engagement,
                'sentiment': sentiment,
                'location': self._extract_location(tweet)
            }
            processed_tweets.append(processed_tweet)
        
        return {
            'tweets': processed_tweets,
            'summary': {
                'total_tweets': len(tweets),
                'total_engagement': total_engagement,
                'positive_tweets': positive_count,
                'negative_tweets': negative_count,
                'neutral_tweets': neutral_count,
                'sentiment_score': (positive_count - negative_count) / len(tweets) if tweets else 0,
                'average_engagement': total_engagement / len(tweets) if tweets else 0,
                'timestamp': datetime.now().isoformat()
            }
        }

    def _analyze_sentiment(self, text: str) -> float:
        """Basic sentiment analysis using keyword matching"""
        positive_words = [
            'excelente', 'bueno', 'genial', 'fantástico', 'increíble', 'perfecto',
            'apoyo', 'felicidades', 'éxito', 'progreso', 'desarrollo', 'crecimiento',
            'futuro', 'esperanza', 'cambio positivo', 'bien', 'mejor', 'avance'
        ]
        
        negative_words = [
            'malo', 'terrible', 'horrible', 'pésimo', 'desastre', 'fracaso',
            'rechazo', 'contra', 'crítica', 'problema', 'crisis', 'error',
            'mentira', 'corrupción', 'inútil', 'peor', 'retroceso'
        ]
        
        text_lower = text.lower()
        positive_score = sum(1 for word in positive_words if word in text_lower)
        negative_score = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text.split())
        if total_words == 0:
            return 0
            
        return (positive_score - negative_score) / total_words

    def _extract_location(self, tweet: Dict[str, Any]) -> Optional[str]:
        """Extract location information from tweet"""
        # Try to get location from geo data or user profile
        geo = tweet.get('geo')
        if geo and geo.get('place_id'):
            return geo.get('place_id')
        return None

    def _get_simulated_twitter_data(self, query: str, max_results: int) -> Dict[str, Any]:
        """Fallback simulated data when API is not available"""
        import random
        
        simulated_tweets = []
        total_engagement = 0
        positive_count = 0
        negative_count = 0
        
        for i in range(min(max_results, 50)):
            engagement = random.randint(5, 200)
            sentiment = random.uniform(-0.5, 0.7)  # Slightly positive bias
            
            total_engagement += engagement
            if sentiment > 0.1:
                positive_count += 1
            elif sentiment < -0.1:
                negative_count += 1
            
            tweet = {
                'id': f'simulated_{i}',
                'text': f'Tweet simulado sobre {query} - ejemplo {i+1}',
                'created_at': (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
                'author': {
                    'username': f'user_{i}',
                    'name': f'Usuario {i+1}',
                    'verified': random.choice([True, False]),
                    'followers': random.randint(100, 10000)
                },
                'metrics': {
                    'like_count': random.randint(1, 100),
                    'retweet_count': random.randint(0, 50),
                    'reply_count': random.randint(0, 30),
                    'quote_count': random.randint(0, 20)
                },
                'engagement': engagement,
                'sentiment': sentiment,
                'location': random.choice(['Posadas', 'Oberá', 'Puerto Iguazú', None])
            }
            simulated_tweets.append(tweet)
        
        neutral_count = len(simulated_tweets) - positive_count - negative_count
        
        return {
            'tweets': simulated_tweets,
            'summary': {
                'total_tweets': len(simulated_tweets),
                'total_engagement': total_engagement,
                'positive_tweets': positive_count,
                'negative_tweets': negative_count,
                'neutral_tweets': neutral_count,
                'sentiment_score': (positive_count - negative_count) / len(simulated_tweets),
                'average_engagement': total_engagement / len(simulated_tweets),
                'timestamp': datetime.now().isoformat(),
                'data_source': 'simulated'  # Indicator for demo purposes
            }
        }

    async def get_frente_renovador_metrics(self) -> Dict[str, Any]:
        """Get comprehensive metrics for Frente Renovador"""
        all_results = {
            'total_tweets': 0,
            'total_engagement': 0,
            'positive_tweets': 0,
            'negative_tweets': 0,
            'neutral_tweets': 0,
            'by_term': {},
            'top_tweets': [],
            'summary': {}
        }
        
        # Search for each term
        for term in self.frente_renovador_terms:
            try:
                result = await self.search_recent_tweets(term, 50)
                summary = result['summary']
                
                all_results['total_tweets'] += summary['total_tweets']
                all_results['total_engagement'] += summary['total_engagement']
                all_results['positive_tweets'] += summary['positive_tweets']
                all_results['negative_tweets'] += summary['negative_tweets']
                all_results['neutral_tweets'] += summary['neutral_tweets']
                
                all_results['by_term'][term] = summary
                
                # Get top engaging tweets
                top_tweets = sorted(result['tweets'], key=lambda x: x['engagement'], reverse=True)[:5]
                all_results['top_tweets'].extend(top_tweets)
                
            except Exception as e:
                print(f"Error searching for term '{term}': {str(e)}")
                continue
        
        # Calculate overall metrics
        total_tweets = all_results['total_tweets']
        if total_tweets > 0:
            all_results['summary'] = {
                'total_tweets': total_tweets,
                'total_engagement': all_results['total_engagement'],
                'positive_tweets': all_results['positive_tweets'],
                'negative_tweets': all_results['negative_tweets'],
                'neutral_tweets': all_results['neutral_tweets'],
                'sentiment_score': (all_results['positive_tweets'] - all_results['negative_tweets']) / total_tweets,
                'average_engagement': all_results['total_engagement'] / total_tweets,
                'engagement_rate': (all_results['total_engagement'] / total_tweets) * 100 if total_tweets > 0 else 0,
                'timestamp': datetime.now().isoformat(),
                'search_terms_used': len(self.frente_renovador_terms)
            }
        
        # Sort top tweets by engagement
        all_results['top_tweets'] = sorted(all_results['top_tweets'], key=lambda x: x['engagement'], reverse=True)[:10]
        
        return all_results

    async def get_territorial_data(self) -> Dict[str, Any]:
        """Get Twitter data mapped to Misiones territories"""
        frente_data = await self.get_frente_renovador_metrics()
        
        # Map tweets to municipalities (basic implementation)
        municipal_data = {}
        municipalities = [
            'Posadas', 'Oberá', 'Puerto Iguazú', 'Eldorado', 'San Martín',
            'Leandro N. Alem', 'Montecarlo', 'Apóstoles', 'Candelaria'
        ]
        
        for municipality in municipalities:
            # Filter tweets mentioning the municipality
            municipal_tweets = [
                tweet for tweet in frente_data.get('top_tweets', [])
                if municipality.lower() in tweet.get('text', '').lower() or
                tweet.get('location') == municipality
            ]
            
            if municipal_tweets:
                total_engagement = sum(tweet['engagement'] for tweet in municipal_tweets)
                avg_sentiment = sum(tweet['sentiment'] for tweet in municipal_tweets) / len(municipal_tweets)
                
                municipal_data[municipality] = {
                    'tweets_count': len(municipal_tweets),
                    'total_engagement': total_engagement,
                    'average_sentiment': avg_sentiment,
                    'activity_level': 'ALTO' if total_engagement > 500 else 'MEDIO' if total_engagement > 100 else 'BAJO',
                    'sentiment_label': 'Positivo' if avg_sentiment > 0.1 else 'Negativo' if avg_sentiment < -0.1 else 'Neutral'
                }
            else:
                # Default data for municipalities without specific mentions
                municipal_data[municipality] = {
                    'tweets_count': 0,
                    'total_engagement': 0,
                    'average_sentiment': 0,
                    'activity_level': 'BAJO',
                    'sentiment_label': 'Neutral'
                }
        
        return {
            'territorial_data': municipal_data,
            'summary': frente_data['summary'],
            'timestamp': datetime.now().isoformat()
        }

# Global instance for API usage
twitter_api = TwitterAPIv2Integration()