import os
import random
import sys

# ASCII symbols
WALL = '#'
FLOOR = '.'
SPAWN = 'S'
STAIRS_DOWN = '>'
STAIRS_UP = '<'
DOOR = 'D'

class Leaf:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.left_child = None
        self.right_child = None
        self.room = None
        self.halls = []

    def split(self):
        if self.left_child or self.right_child:
            return False

        MIN_LEAF_SIZE = 8

        # Decide split direction
        split_h = random.random() > 0.5
        if self.width > self.height and self.width / self.height >= 1.25:
            split_h = False
        elif self.height > self.width and self.height / self.width >= 1.25:
            split_h = True

        max_size = (self.height if split_h else self.width) - MIN_LEAF_SIZE
        if max_size <= MIN_LEAF_SIZE:
            return False

        split = random.randint(MIN_LEAF_SIZE, max_size)

        if split_h:
            self.left_child = Leaf(self.x, self.y, self.width, split)
            self.right_child = Leaf(self.x, self.y + split, self.width, self.height - split)
        else:
            self.left_child = Leaf(self.x, self.y, split, self.height)
            self.right_child = Leaf(self.x + split, self.y, self.width - split, self.height)
        
        return True

    def create_rooms(self):
        if self.left_child or self.right_child:
            if self.left_child:
                self.left_child.create_rooms()
            if self.right_child:
                self.right_child.create_rooms()
            if self.left_child and self.right_child:
                self.create_hall(self.left_child.get_room(), self.right_child.get_room())
        else:
            room_size_x = random.randint(4, max(4, self.width - 2))
            room_size_y = random.randint(4, max(4, self.height - 2))
            
            room_pos_x = random.randint(1, max(1, self.width - room_size_x - 1))
            room_pos_y = random.randint(1, max(1, self.height - room_size_y - 1))
            
            self.room = {
                'x': self.x + room_pos_x,
                'y': self.y + room_pos_y,
                'w': room_size_x,
                'h': room_size_y
            }

    def get_room(self):
        if self.room:
            return self.room
        l_room = None
        r_room = None
        if self.left_child:
            l_room = self.left_child.get_room()
        if self.right_child:
            r_room = self.right_child.get_room()
        if not l_room and not r_room:
            return None
        if not r_room:
            return l_room
        if not l_room:
            return r_room
        return l_room if random.random() > 0.5 else r_room

    def create_hall(self, l_room, r_room):
        if not l_room or not r_room:
            return
        
        x1 = l_room['x'] + l_room['w'] // 2
        y1 = l_room['y'] + l_room['h'] // 2
        x2 = r_room['x'] + r_room['w'] // 2
        y2 = r_room['y'] + r_room['h'] // 2
        
        self.halls.append((x1, y1, x2, y2))

    def collect_rooms(self, rooms_arr):
        if self.room:
            rooms_arr.append(self.room)
        if self.left_child:
            self.left_child.collect_rooms(rooms_arr)
        if self.right_child:
            self.right_child.collect_rooms(rooms_arr)

    def collect_halls(self, halls_arr):
        if self.halls:
            halls_arr.extend(self.halls)
        if self.left_child:
            self.left_child.collect_halls(halls_arr)
        if self.right_child:
            self.right_child.collect_halls(halls_arr)


class DungeonGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.grid = [[WALL for _ in range(width)] for _ in range(height)]
        self.rooms = []

    def generate(self, level_num):
        root = Leaf(0, 0, self.width, self.height)
        leaves = [root]

        did_split = True
        while did_split:
            did_split = False
            for leaf in list(leaves):
                if not leaf.left_child and not leaf.right_child:
                    if leaf.width > 15 or leaf.height > 15 or random.random() > 0.25:
                        if leaf.split():
                            leaves.append(leaf.left_child)
                            leaves.append(leaf.right_child)
                            did_split = True

        root.create_rooms()

        self.rooms = []
        root.collect_rooms(self.rooms)

        for room in self.rooms:
            for y in range(room['y'], room['y'] + room['h']):
                for x in range(room['x'], room['x'] + room['w']):
                    # Keep borders completely solid
                    if 0 < x < self.width - 1 and 0 < y < self.height - 1:
                        self.grid[y][x] = FLOOR

        halls = []
        root.collect_halls(halls)
        for (x1, y1, x2, y2) in halls:
            self._create_corridor(x1, y1, x2, y2)

        # Place Doors where corridors meet rooms
        self._place_doors()

        # Place Spawn and Stairs
        if self.rooms:
            spawn_room = self.rooms[0]
            stairs_room = self.rooms[-1]

            spawn_x = spawn_room['x'] + spawn_room['w'] // 2
            spawn_y = spawn_room['y'] + spawn_room['h'] // 2
            
            if 0 < spawn_x < self.width - 1 and 0 < spawn_y < self.height - 1:
                self.grid[spawn_y][spawn_x] = SPAWN
                
            if level_num > 1:
                self._place_wall_decal(spawn_room, STAIRS_UP)
            
            self._place_wall_decal(stairs_room, STAIRS_DOWN)

    def _place_wall_decal(self, room, char):
        # Try to place on the middle of an edge that is a wall
        cx = room['x'] + room['w'] // 2
        cy = room['y'] + room['h'] // 2
        
        # Top edge
        if self.grid[room['y'] - 1][cx] == WALL:
            self.grid[room['y']][cx] = char
            return
        # Bottom edge
        ty = room['y'] + room['h'] - 1
        if self.grid[ty + 1][cx] == WALL:
            self.grid[ty][cx] = char
            return
        # Left edge
        if self.grid[cy][room['x'] - 1] == WALL:
            self.grid[cy][room['x']] = char
            return
        # Right edge
        tx = room['x'] + room['w'] - 1
        if self.grid[cy][tx + 1] == WALL:
            self.grid[cy][tx] = char
            return
            
        # Fallback: just put it anywhere inside the room
        self.grid[cy][cx] = char

    def _create_corridor(self, x1, y1, x2, y2):
        x, y = x1, y1
        while x != x2:
            if 0 < x < self.width - 1 and 0 < y < self.height - 1:
                self.grid[y][x] = FLOOR
            x += 1 if x < x2 else -1
            
        while y != y2:
            if 0 < x < self.width - 1 and 0 < y < self.height - 1:
                self.grid[y][x] = FLOOR
            y += 1 if y < y2 else -1

        if 0 < x < self.width - 1 and 0 < y < self.height - 1:
            self.grid[y][x] = FLOOR

    def _place_doors(self):
        for y in range(1, self.height - 1):
            for x in range(1, self.width - 1):
                if self.grid[y][x] == FLOOR:
                    # Check if it's a corridor going into a room
                    # A door is typically placed in a bottleneck
                    neighbors = [
                        self.grid[y-1][x] == WALL,
                        self.grid[y+1][x] == WALL,
                        self.grid[y][x-1] == WALL,
                        self.grid[y][x+1] == WALL
                    ]
                    # If it has 2 opposite walls, it's a corridor
                    if (neighbors[0] and neighbors[1] and not neighbors[2] and not neighbors[3]) or \
                       (not neighbors[0] and not neighbors[1] and neighbors[2] and neighbors[3]):
                        # Random chance to place a door in narrow corridors to avoid clutter
                        if random.random() < 0.1:
                            self.grid[y][x] = DOOR

    def to_string(self):
        return "\n".join("".join(row) for row in self.grid)

def generate_levels():
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'levels')
    os.makedirs(output_dir, exist_ok=True)
    
    for level_num in range(1, 11):
        # Progressively larger levels
        size = 30 + (level_num - 1) * 2  # Level 1 is 30x30, Level 10 is 48x48
        
        gen = DungeonGenerator(size, size)
        gen.generate(level_num)
        
        filepath = os.path.join(output_dir, f'Level{level_num}.txt')
        with open(filepath, 'w') as f:
            f.write(gen.to_string())
            f.write("\n")
            
        print(f"Generated {filepath} ({size}x{size})")

if __name__ == "__main__":
    generate_levels()
