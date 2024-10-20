import os

# Define the directory
directory = './assets/images/engine_parts'

# List to store image paths
image_paths = []

# Walk through the directory
for root, _, files in os.walk(directory):
    for file in files:
        # Check if the file is an image
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
            # Construct the relative path
            relative_path = os.path.join(root, file)
            image_paths.append(relative_path)

# Print the list of image paths
for path in image_paths:
    print(path)