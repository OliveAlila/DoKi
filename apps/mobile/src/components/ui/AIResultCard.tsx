import * as React from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface AIResultCardProps {
  category: string;
  confidence: number;
  moisture: number;
  purity: number;
  flaggedContaminants: string[];
  onPublish: () => void;
  onRetake: () => void;
  isPublishing?: boolean;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({
  category,
  confidence,
  moisture,
  purity,
  flaggedContaminants,
  onPublish,
  onRetake,
  isPublishing = false,
}) => {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Card className="w-full bg-card border-border max-w-md mx-auto">
      <View className="space-y-4">
        {/* Header */}
        <View className="border-b border-border pb-3">
          <Text variant="h3" className="text-primary font-bold text-xl">
            Visual Verification Stream Audit
          </Text>
          <Text variant="muted">Deterministic Classification Successful</Text>
        </View>

        {/* Category & Confidence */}
        <View className="space-y-2 mt-2">
          <View className="flex flex-row justify-between items-center mb-1">
            <Text variant="large" className="font-semibold text-lg">
              {category}
            </Text>
            <View className="bg-primary/20 px-2.5 py-1 rounded-full">
              <Text className="text-primary font-semibold text-xs">
                {confidencePercent}% Confident
              </Text>
            </View>
          </View>
          <Progress value={confidencePercent} className="mt-1" />
        </View>

        {/* Moisture & Purity */}
        <View className="flex flex-row justify-between gap-4 py-2 mt-2">
          <View className="flex-1 bg-muted/40 p-3 rounded-lg border border-border">
            <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Relative Moisture Coefficient (RMC)
            </Text>
            <Text className="text-xl font-bold text-accent mt-1 mb-2">
              {moisture.toFixed(1)}%
            </Text>
            <Progress value={moisture} />
          </View>
          <View className="flex-1 bg-muted/40 p-3 rounded-lg border border-border">
            <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Verified Composition Purity Index (CPI)
            </Text>
            <Text className="text-xl font-bold text-accent mt-1 mb-2">
              {purity.toFixed(1)}%
            </Text>
            <Progress value={purity} />
          </View>
        </View>

        {/* Flagged Contaminants */}
        <View className="py-1 mt-2">
          <Text className="font-semibold text-sm text-foreground mb-1.5">
            Contamination Review:
          </Text>
          {flaggedContaminants.length > 0 ? (
            <View className="bg-warning/20 border border-warning/30 p-3 rounded-lg">
              <Text className="text-warning font-semibold text-sm mb-1">
                Compliance Warning: Contamination Threshold Exceeded. Industrial grading may be affected.
              </Text>
              <Text variant="small" className="text-muted-foreground text-xs mt-1">
                Detected: {flaggedContaminants.join(', ')}
              </Text>
            </View>
          ) : (
            <View className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
              <Text className="text-primary font-semibold text-sm">
                Compliance Success: Verified Pure Feedstock
              </Text>
              <Text variant="small" className="text-muted-foreground text-xs mt-0.5">
                Zero contamination elements detected.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex flex-row gap-3 pt-2 mt-3">
          <Button
            variant="outline"
            className="flex-1 min-h-[48px]"
            onPress={onRetake}
            disabled={isPublishing}
          >
            Retake
          </Button>
          <Button
            variant="default"
            className="flex-1 min-h-[48px]"
            onPress={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </View>
      </View>
    </Card>
  );
};
