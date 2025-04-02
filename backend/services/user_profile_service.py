from dataclasses import dataclass, field
from datetime import datetime
import json
from pathlib import Path
from typing import Dict, List, Optional

@dataclass
class UserProfile:
    user_id: str
    flavor_prefs: Dict[str, float] = field(default_factory=dict)
    coffee_types: Dict[str, int] = field(default_factory=dict)
    last_updated: str = field(default_factory=lambda: datetime.now().isoformat())

class UserProfileService:
    def __init__(self):
        self.db_path = Path(__file__).parent.parent / 'database/user_profiles.json'
        self.profiles = self._load_profiles()
    
    def _load_profiles(self) -> Dict[str, UserProfile]:
        try:
            with open(self.db_path, 'r') as f:
                return {uid: UserProfile(**data) for uid, data in json.load(f).items()}
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def update_profile(self, user_id: str, coffee_id: str, rating: float = 0):
        from database.coffee_repository import CoffeeRepository
        coffee = CoffeeRepository().get_by_id(int(coffee_id))
        if not coffee:
            return
        
        profile = self.profiles.setdefault(user_id, UserProfile(user_id=user_id))
        for flavor in coffee.flavor_tags:
            profile.flavor_prefs[flavor] = profile.flavor_prefs.get(flavor, 0) + 1 + (rating/5)
        profile.coffee_types[coffee.type] = profile.coffee_types.get(coffee.type, 0) + 1
        self._save_profiles()
    
    def _save_profiles(self):
        with open(self.db_path, 'w') as f:
            json.dump({uid: profile.__dict__ for uid, profile in self.profiles.items()}, f, indent=2)
    
    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """获取用户画像，可能返回None"""
        return self.profiles.get(user_id)