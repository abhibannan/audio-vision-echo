
import React, { FC, useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { speak } from '../utils/speechUtils';
import AudioFeedback from './AudioFeedback';
import { Eye, Upload } from 'lucide-react';

interface Prediction {
  className: string;
  probability: number;
}

interface ImageRecognitionProps {
  selectedGenre: string;
  touchToSpeakEnabled: boolean;
}

const ImageRecognition: FC<ImageRecognitionProps> = ({ selectedGenre, touchToSpeakEnabled }) => {
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<any>(null);

  // Load MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Loading MobileNet model...');
        // Load the model
        modelRef.current = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
        );
        setIsModelLoaded(true);
        console.log('MobileNet model loaded successfully');
        speak('Image recognition system ready');
      } catch (error) {
        console.error('Failed to load model:', error);
        speak('Failed to load image recognition model');
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      // Dispose of tensors and models when component unmounts
      if (modelRef.current) {
        try {
          // Clean up any tensors
          tf.dispose(modelRef.current);
        } catch (e) {
          console.error('Error disposing model:', e);
        }
      }
    };
  }, []);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create URL for the selected image
    const url = URL.createObjectURL(file);
    setImageURL(url);
    speak(`Image selected: ${file.name}`);

    // Predict with the selected image
    predictWithImage(url);
  };

  // Click handler for the file input button
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Predict function
  const predictWithImage = async (imageURL: string) => {
    if (!modelRef.current || !isModelLoaded) {
      speak('Model not loaded yet. Please wait.');
      return;
    }

    setIsProcessing(true);
    setPredictions([]);
    speak('Processing image');

    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        // Preprocess the image to match MobileNet input requirements
        const tensor = tf.browser
          .fromPixels(img)
          .resizeNearestNeighbor([224, 224]) // resize to 224x224
          .toFloat()
          .expandDims();

        // Normalize the image
        const normalized = tensor.div(127.5).sub(1);

        // Make prediction
        const predictions = await modelRef.current.predict(normalized);
        const data = await predictions.data();

        // Get the class names from the model
        const classes = await fetch(
          'https://storage.googleapis.com/tfjs-models/assets/mobilenet/imagenet_classes.json'
        ).then(response => response.json());

        // Process predictions
        const predictionArray = Array.from(data)
          .map((probability, index) => {
            return {
              className: classes[index],
              probability: probability as number,
            };
          })
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 5);

        setPredictions(predictionArray);
        setIsProcessing(false);

        // Filter predictions based on genre if needed
        let filteredPredictions = predictionArray;
        if (selectedGenre !== 'General') {
          // Simple matching based on genre - this is a basic implementation
          filteredPredictions = predictionArray.filter(p => {
            if (selectedGenre === 'Animals') {
              return /dog|cat|bird|fish|animal|tiger|lion|elephant|bear|fox/.test(p.className.toLowerCase());
            } else if (selectedGenre === 'Vehicles') {
              return /car|truck|bus|train|airplane|vehicle|motorcycle/.test(p.className.toLowerCase());
            } else if (selectedGenre === 'Food') {
              return /food|fruit|vegetable|dish|meal|pizza|burger|apple|banana/.test(p.className.toLowerCase());
            }
            return true;
          });
        }

        // If no filtered predictions, use the top original prediction
        const topPrediction = filteredPredictions.length > 0 
          ? filteredPredictions[0] 
          : predictionArray[0];

        // Automatically speak if touch to speak is enabled
        if (touchToSpeakEnabled) {
          speak(`I see ${topPrediction.className} with ${Math.round(topPrediction.probability * 100)}% confidence`);
        }

        // Clean up tensors
        tf.dispose([tensor, normalized, predictions]);
      };

      img.onerror = () => {
        setIsProcessing(false);
        speak('Error loading image. Please try again.');
      };

      img.src = imageURL;
    } catch (error) {
      console.error('Prediction error:', error);
      setIsProcessing(false);
      speak('Error processing image. Please try again.');
    }
  };

  // Handle speaking the prediction
  const handleSpeakPrediction = () => {
    if (predictions.length > 0) {
      const topPrediction = predictions[0];
      speak(`I see ${topPrediction.className} with ${Math.round(topPrediction.probability * 100)}% confidence`);
    } else {
      speak('No predictions available yet. Please upload an image first.');
    }
  };

  return (
    <Card className="w-full shadow-lg max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center w-full gap-6">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <AudioFeedback text="AI Image Recognition System" isButton={true}>
              <button
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors focus-ring"
                onClick={() => speak('AI Image Recognition System')}
                aria-label="AI Image Recognition System"
              >
                <Eye className="h-8 w-8 text-primary" />
              </button>
            </AudioFeedback>
            <h2 className="text-2xl font-bold text-primary">AI Vision</h2>
          </div>

          {/* Upload Section */}
          <div className="w-full max-w-md">
            <AudioFeedback text="Upload an image for recognition" isButton={true}>
              <div 
                className="relative flex items-center justify-center w-full p-4 bg-white dark:bg-secondary rounded-full shadow-sm hover:shadow-md transition-all border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary/50 cursor-pointer"
                onClick={handleUploadClick}
                tabIndex={0}
                role="button"
                aria-label="Upload an image"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleUploadClick();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Upload image file"
                />
                <Upload className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Upload an image</span>
              </div>
            </AudioFeedback>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="w-full max-w-md">
              <p className="text-sm text-center mb-2">Processing image...</p>
              <Progress value={50} className="h-2" />
            </div>
          )}

          {/* Image Preview */}
          {imageURL && !isProcessing && (
            <div className="w-full max-w-md aspect-square relative overflow-hidden rounded-lg border border-border">
              <img
                src={imageURL}
                alt="Preview of uploaded image"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Prediction Results */}
          {!isProcessing && predictions.length > 0 && (
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">Recognition Results</h3>
              <div className="space-y-2">
                {predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{prediction.className}</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={prediction.probability * 100}
                        className="w-32 h-2"
                      />
                      <span className="text-xs w-12 text-right">
                        {Math.round(prediction.probability * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Touch to Speak Button */}
              <AudioFeedback text="Speak prediction aloud" isButton={true}>
                <Button
                  onClick={handleSpeakPrediction}
                  className="w-full mt-2 bg-ai-blue hover:bg-ai-blue-dark transition-colors interactive-hover focus-ring"
                  disabled={predictions.length === 0}
                  aria-label="Speak prediction aloud"
                >
                  Touch to Hear Prediction
                </Button>
              </AudioFeedback>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageRecognition;
