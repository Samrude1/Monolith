$appleBase64 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAB1MAAA6mAAADqYAAA7aGxA7AzAAAAA9SURBVHjaYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYAD/6wB/2H6mIAAAAABJRU5ErkJggg=="
$bytes = [Convert]::FromBase64String($appleBase64)
[IO.File]::WriteAllBytes("assets\textures\entities\apple.png", $bytes)
Write-Host "[OK] Omena on nyt matalaresoluutiota ja peli valmis!"
