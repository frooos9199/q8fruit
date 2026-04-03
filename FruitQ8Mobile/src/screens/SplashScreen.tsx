import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZE } from '../constants';

const { width, height } = Dimensions.get('window');
const BORDER_RADIUS_FULL = 999;

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Floating fruits animations
  const fruit1 = useRef(new Animated.Value(0)).current;
  const fruit2 = useRef(new Animated.Value(0)).current;
  const fruit3 = useRef(new Animated.Value(0)).current;
  const fruit4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating fruits
    const floatAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floatAnimation(fruit1, 0);
    floatAnimation(fruit2, 500);
    floatAnimation(fruit3, 1000);
    floatAnimation(fruit4, 1500);

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Main');
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY1 = fruit1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const translateY2 = fruit2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const translateY3 = fruit3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  const translateY4 = fruit4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background Effect */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Floating Fruits */}
      <Animated.Text style={[styles.floatingFruit, styles.fruit1, { transform: [{ translateY: translateY1 }] }]}>
        🍎
      </Animated.Text>
      <Animated.Text style={[styles.floatingFruit, styles.fruit2, { transform: [{ translateY: translateY2 }] }]}>
        🍊
      </Animated.Text>
      <Animated.Text style={[styles.floatingFruit, styles.fruit3, { transform: [{ translateY: translateY3 }] }]}>
        🍇
      </Animated.Text>
      <Animated.Text style={[styles.floatingFruit, styles.fruit4, { transform: [{ translateY: translateY4 }] }]}>
        🍌
      </Animated.Text>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Animated.View
          style={[
            styles.logoCircle,
            {
              transform: [{ rotate: spin }, { scale: pulseAnim }],
            },
          ]}>
          <View style={styles.innerCircle}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: slideUpAnim }] }}>
          <Text style={styles.title}>فكهاني الكويت</Text>
          <Text style={styles.titleEn}>Fruit Q8</Text>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerIcon}>✨</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.taglineContainer}>
            <View style={styles.tagBox}>
              <Text style={styles.tagEmoji}>🌱</Text>
              <Text style={styles.tagText}>طازج</Text>
            </View>
            <View style={styles.tagBox}>
              <Text style={styles.tagEmoji}>⚡</Text>
              <Text style={styles.tagText}>سريع</Text>
            </View>
            <View style={styles.tagBox}>
              <Text style={styles.tagEmoji}>✅</Text>
              <Text style={styles.tagText}>مضمون</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>🇰🇼 صنع بحب في الكويت</Text>
        <View style={styles.loadingDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height / 2,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height / 3,
    backgroundColor: 'rgba(27, 94, 32, 0.5)',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
  },
  floatingFruit: {
    position: 'absolute',
    fontSize: 50,
    opacity: 0.3,
  },
  fruit1: { top: '15%', left: '10%' },
  fruit2: { top: '25%', right: '15%' },
  fruit3: { bottom: '30%', left: '15%' },
  fruit4: { bottom: '20%', right: '10%' },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontFamily: 'System',
  },
  titleEn: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    width: 40,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  dividerIcon: {
    fontSize: 20,
    marginHorizontal: SPACING.sm,
  },
  taglineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  tagBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS_FULL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
});
