import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))
from tests.coffee_test_utils import CoffeeTestUtils

def main():
    tester = CoffeeTestUtils()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--profile':
        user_id = sys.argv[2] if len(sys.argv) > 2 else "test_user"
        print(f"\n模拟用户 {user_id} 行为...")
        tester.generate_user_behavior(user_id)
        
        profile = tester.profile_service.get_profile(user_id)
        if profile is None:
            print("未找到用户画像数据")
            return
            
        print(f"\n用户画像生成结果:")
        print(f"用户ID: {user_id}")
        print(f"风味偏好: {profile.flavor_prefs}")
        print(f"咖啡类型偏好: {profile.coffee_types}")
        return
    
    print("当前咖啡列表:")
    for coffee in tester.list_all_coffees():
        print(f"{coffee.id}: {coffee.name}")
    
    print("\n添加5条测试数据...")
    tester.add_test_data(5)
    
    print("\n更新后的咖啡列表:")
    for coffee in tester.list_all_coffees():
        print(f"{coffee.id}: {coffee.name}")

if __name__ == '__main__':
    main()