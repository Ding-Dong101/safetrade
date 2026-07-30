import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

/**
 * A single skeleton block with a left-to-right shimmer animation.
 */
const Skeleton = ({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) => {
    const { colors, isDark } = useTheme();
    const shimmer = useRef(new Animated.Value(0)).current;

    const baseColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const highlightColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)";

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: false,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const backgroundColor = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColor, highlightColor],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor,
                },
                style,
            ]}
        />
    );
};

export default Skeleton;
