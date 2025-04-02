import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional

@dataclass
class Coffee:
    id: int
    name: str
    type: str
    sugar: int
    flavor_tags: List[str]
    caffeine_level: int
    # 可扩展字段
    description: str = ""
    ingredients: List[str] = field(default_factory=list)  # 修改为默认空列表
    seasonal: bool = False

class CoffeeRepository:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_data()
        return cls._instance
    
    def _load_data(self):
        """从JSON文件加载咖啡数据"""
        with open('/Users/bytedance/Downloads/aiTools/extersion/tools/projects/CoffeeRecommendation/backend/database/coffee_data.json') as f:
            raw_data = json.load(f)
        self.coffees = [Coffee(**item) for item in raw_data]
    
    def get_by_id(self, coffee_id: int) -> Optional[Coffee]:
        """根据ID获取咖啡"""
        return next((c for c in self.coffees if c.id == coffee_id), None)
    
    def get_by_flavor(self, flavor_tags: List[str]) -> List[Coffee]:
        """根据风味标签筛选咖啡"""
        return [c for c in self.coffees 
               if any(tag in c.flavor_tags for tag in flavor_tags)]
    
    def add_coffee(self, coffee: Dict) -> None:
        """添加新咖啡品种"""
        new_id = max(c.id for c in self.coffees) + 1
        self.coffees.append(Coffee(id=new_id, **coffee))
        self._save_data()
    
    def _save_data(self):
        """保存数据到JSON文件"""
        with open('/Users/bytedance/Downloads/aiTools/extersion/tools/projects/CoffeeRecommendation/backend/database/coffee_data.json', 'w') as f:
            json.dump([c.__dict__ for c in self.coffees], f, indent=2, ensure_ascii=False)