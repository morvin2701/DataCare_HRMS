from deepface import DeepFace
import numpy as np
import pickle
import cv2
import os

# Create a temporary directory for saving uploaded files if it doesn't exist
if not os.path.exists("temp"):
    os.makedirs("temp")

def get_face_encoding(image_file):
    """
    Generates a face encoding using DeepFace (ArcFace model).
    Expects an image file object (FastAPI UploadFile).
    Returns bytes of the numpy array embedding.
    """
    import uuid
    temp_path = None
    try:
        # Create unique temp filename
        unique_filename = f"{uuid.uuid4()}.jpg"
        temp_path = f"temp/{unique_filename}"
        
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            image_file.seek(0)
            buffer.write(image_file.read())

        # Generate embedding
        embedding_objs = DeepFace.represent(
            img_path=temp_path,
            model_name="ArcFace",
            detector_backend="opencv",
            enforce_detection=True
        )
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if len(embedding_objs) > 0:
            return pickle.dumps(embedding_objs[0]["embedding"])
            
    except Exception as e:
        print(f"Error generating encoding: {e}")
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            
    return None

def compare_faces_with_db(users, unknown_image_file):
    """
    Compare an unknown image with all users in the database using Cosine Similarity.
    """
    import uuid
    temp_path = None
    try:
        # Create unique temp filename
        unique_filename = f"unknown_{uuid.uuid4()}.jpg"
        temp_path = f"temp/{unique_filename}"
        
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            unknown_image_file.seek(0)
            buffer.write(unknown_image_file.read())

        # Get embedding for unknown face
        target_embedding_objs = DeepFace.represent(
            img_path=temp_path,
            model_name="ArcFace",
            detector_backend="opencv",
            enforce_detection=True
        )
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not target_embedding_objs:
            return None

        target_embedding = target_embedding_objs[0]["embedding"]

        # Compare with known users
        # ArcFace threshold for cosine distance is typically around 0.68
        best_match = None
        min_distance = 1.0
        threshold = 0.68

        for user in users:
            known_embedding = pickle.loads(user.face_encoding)
            
            # Calculate Cosine Distance
            a = np.array(known_embedding)
            b = np.array(target_embedding)
            
            # Cosine Distance = 1 - Cosine Similarity
            dot_product = np.dot(a, b)
            norm_a = np.linalg.norm(a)
            norm_b = np.linalg.norm(b)
            cosine_similarity = dot_product / (norm_a * norm_b)
            distance = 1 - cosine_similarity

            if distance < threshold and distance < min_distance:
                min_distance = distance
                best_match = user

        return best_match

    except Exception as e:
        print(f"Error comparing faces: {e}")
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            
    return None
