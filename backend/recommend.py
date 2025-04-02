import sys
import json
import logging
import random
from database.coffee_repository import CoffeeRepository

logging.basicConfig(level=logging.DEBUG)
print("Python脚本开始执行", file=sys.stderr)

# 初始化咖啡数据仓库
coffee_repo = CoffeeRepository()

def recommend_coffee(user_type):
    """
    咖啡推荐核心逻辑
    输入参数:
        user_type: 用户类型 ('new'表示新用户，否则为customerId)
    返回:
        推荐咖啡列表
    """
    if user_type == 'new':
        return random.sample(coffee_repo.coffees, 2)
    else:
        return [coffee_repo.coffees[0]]

if __name__ == '__main__':
    try:
        user_type = sys.argv[1] if len(sys.argv) > 1 else 'new'
        print("收到参数:", user_type, file=sys.stderr)
        result = recommend_coffee(user_type)
        print(json.dumps([c.__dict__ for c in result]))
    except Exception as e:
        print("执行出错:" + str(e), file=sys.stderr)
        sys.exit(1)