import sys
import random
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))
from database.coffee_repository import CoffeeRepository
from services.user_profile_service import UserProfileService

class CoffeeTestUtils:
    def __init__(self):
        self.repo = CoffeeRepository()
        self.profile_service = UserProfileService()

    def list_all_coffees(self):
        """列出所有咖啡"""
        return self.repo.coffees

    def generate_random_coffee(self):
        """生成随机咖啡数据"""
        names = ["美式", "拿铁", "卡布奇诺", "摩卡", "冷萃", "馥芮白", "玛奇朵"]
        types = ["经典", "奶咖", "特色", "季节限定"] 
        flavors = ["坚果", "巧克力", "焦糖", "香草", "水果", "花香", "奶油"]
        
        new_coffee = {
            "name": random.choice(names),
            "type": random.choice(types),
            "sugar": random.randint(0, 3),
            "flavor_tags": random.sample(flavors, k=random.randint(1, 3)),
            "caffeine_level": random.randint(1, 3),
            "description": "随机生成的测试咖啡",
            "seasonal": random.choice([True, False])
        }
        self.repo.add_coffee(new_coffee)
        return new_coffee

    def add_test_data(self, count=5):
        """批量添加测试数据"""
        for _ in range(count):
            self.generate_random_coffee()
        return count

    def generate_user_behavior(self, user_id: str, interactions=5):
        for _ in range(interactions):
            coffee = random.choice(self.repo.coffees)
            rating = random.uniform(3, 5)
            self.profile_service.update_profile(user_id, str(coffee.id), rating)