import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, History, Clock } from 'lucide-react';
import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { db, storage, auth } from "../lib/firebase"; // ✅ เพิ่ม auth
import { onAuthStateChanged, User } from "firebase/auth";

import type { DetectionResult } from '../types';

interface PredictionHistory {
  id: string;
  pest_id: string;
  pest_name: string;
  confidence: number;
  created_at: string;
}

export function ImageDetection() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // ✅ ใช้ Firebase Auth เพื่อตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // ✅ โหลดประวัติการทำนายเมื่อ `userId` มีค่า
  useEffect(() => {
    if (user?.uid) {
      loadPredictionHistory(user.uid);
    }
  }, [user]);

  const loadPredictionHistory = async (userId: string) => {
    if (!userId) return;

    try {
      console.log("✅ Fetching prediction history for user:", userId);
      
      const predictionsRef = collection(db, 'users', userId, 'predictions');
      const q = query(predictionsRef, orderBy('created_at', 'desc'));

      const querySnapshot = await getDocs(q);
      const history: PredictionHistory[] = [];

      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as PredictionHistory);
      });

      setPredictions(history);
      console.log("✅ Prediction history loaded:", history);
    } catch (err: any) {
      console.error('❌ Error loading prediction history:', err.message);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage || !user?.uid) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();

      const predictionData: DetectionResult = {
        pest_id: data.pest_id,
        pest_name: data.pest_name,
        confidence: data.confidence,
        created_at: new Date().toISOString()
      };

      setResult(predictionData);

      // 📌 บันทึกผลลง Firestore
      await addDoc(collection(db, 'users', user.uid, 'predictions'), predictionData);

      // 📥 โหลดประวัติใหม่
      await loadPredictionHistory(user.uid);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCSV = () => {
    const header = "Pest Name,Confidence (%)\n";
    const rows = predictions.map(p => `${p.pest_name},${(p.confidence * 100).toFixed(1)}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
  
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "prediction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pest Detection</h1>
        <p className="mt-2 text-gray-600">
          Upload an image of an insect or pest for instant identification
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <label 
                htmlFor="image-upload"
                className={`relative block w-full aspect-video rounded-lg cursor-pointer
                  border-2 border-dashed border-gray-300 hover:border-green-500
                  transition-colors ${preview ? 'bg-gray-100' : 'bg-white'}`}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click or drag and drop an image here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports JPG, PNG (max 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedImage || isUploading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {isUploading ? 'Processing...' : 'Detect Pest'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Detection Result</h3>
            </div>
            <p className="mt-2 text-gray-900 font-medium">{result.pest_name}</p>
            <p className="text-sm text-gray-600">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* 📜 แสดงประวัติการทำนาย */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Prediction History</h2>
          </div>
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," +
                ["ID,Pest Name,Confidence,Created At"].concat(
                  predictions.map(p => `${p.id},${p.pest_name},${(p.confidence * 100).toFixed(1)}%,${p.created_at}`)
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "prediction_history.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download CSV
          </button>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{prediction.pest_name}</h3>
                <p className="text-sm text-gray-500">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
