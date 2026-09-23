import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BERGAMOT_EN_ES,
  BERGAMOT_EN_FR,
  loadModel,
  translate,
  unloadModel,
} from "@qvac/sdk";

type Target = "es" | "fr";

const MODELS: Record<Target, typeof BERGAMOT_EN_ES | typeof BERGAMOT_EN_FR> = {
  es: BERGAMOT_EN_ES,
  fr: BERGAMOT_EN_FR,
};

const TARGET_NAMES: Record<Target, string> = {
  es: "Spanish",
  fr: "French",
};

export default function App() {
  const [target, setTarget] = useState<Target>("es");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
const [status, setStatus] = useState("Ready - model loads when you translate");
  const [progress, setProgress] = useState<number | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadTranslationModel(): Promise<string> {
    if (modelId) {
      return modelId;
    }

    setStatus(`Loading offline ${TARGET_NAMES[target]} model...`);
    setProgress(0);

    const id = await loadModel({
      modelSrc: target === "es" ? BERGAMOT_EN_ES : BERGAMOT_EN_FR,
      modelConfig: {
        engine: "Bergamot",
        from: "en",
        to: target,
      } as any,
    } as any);

    setModelId(id);
    setProgress(null);
    setStatus("Ready - model loads when you translate");

    return id;
  }
  async function handleTranslate() {
    try {
      setOutput("Loading QVAC model...");

      const id = await loadTranslationModel();

      setOutput("Translating...");

      const result = await translate({
        modelId: id,
        text: input.trim(),
        modelType: "nmt",
        stream: false,
      });

      const translatedText = await result.text;
      setOutput(translatedText.replace(/^[\u00A1\u00BF]/, ""));
    } catch (error) {
      setOutput(
        error instanceof Error
          ? error.name + ": " + error.message
          : JSON.stringify(error)
      );
    }
  }

  async function handleTargetChange(nextTarget: Target) {
    setBusy(true);

    try {
      if (modelId) {
        await unloadModel({
          modelId,
          clearStorage: false,
        });
      }
    } catch {
      // Continue even if unloading the previous model reports an error.
    } finally {
      setModelId(null);
      setOutput("");
      setProgress(null);
      setTarget(nextTarget);
    setStatus("Ready - model loads when you translate");
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>QVAC - ON-DEVICE AI</Text>
            <Text style={styles.title}>Pocket Translator</Text>
            <Text style={styles.subtitle}>
              Private translation that runs directly on your Android device.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Translate English to</Text>

            <View style={styles.languageRow}>
              <Pressable
                style={[
                  styles.languageButton,
                  target === "es" && styles.languageButtonActive,
                ]}
                onPress={() => void handleTargetChange("es")}
              >
                <Text
                  style={[
                    styles.languageText,
                    target === "es" && styles.languageTextActive,
                  ]}
                >
                  Spanish
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.languageButton,
                  target === "fr" && styles.languageButtonActive,
                ]}
                onPress={() => void handleTargetChange("fr")}
              >
                <Text
                  style={[
                    styles.languageText,
                    target === "fr" && styles.languageTextActive,
                  ]}
                >
                  French
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>English</Text>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type something to translate..."
              placeholderTextColor="#8A8F98"
              multiline
              style={styles.input}
              editable={!busy}
              textAlignVertical="top"
            />

            <Pressable
              style={[
                styles.translateButton,
                (busy || !input.trim()) && styles.translateButtonDisabled,
              ]}
              disabled={busy || !input.trim()}
              onPress={() => void handleTranslate()}
            >
              {busy ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.translateButtonText}>
                    {progress !== null
                      ? `Loading ${progress}%`
                      : "Working..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.translateButtonText}>Translate</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{status}</Text>
          </View>

          {progress !== null && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.max(0, Math.min(100, progress))}%` },
                ]}
              />
            </View>
          )}

          <View style={styles.resultCard}>
            <Text style={styles.label}>{TARGET_NAMES[target]}</Text>

            {output ? (
              <Text style={styles.resultText}>{output}</Text>
            ) : (
              <Text style={styles.emptyText}>
                Your translation will appear here.
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              QVAC inference - Bergamot translation - No cloud API
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  keyboard: {
    flex: 1,
  },
  container: {
    padding: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#636A73",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#17191D",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#656B75",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555B65",
    marginBottom: 9,
  },
  languageRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  languageButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#17191D",
    borderColor: "#17191D",
  },
  languageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555B65",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  input: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    lineHeight: 23,
    color: "#17191D",
    backgroundColor: "#FAFAFB",
    marginBottom: 14,
  },
  translateButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#17191D",
    alignItems: "center",
    justifyContent: "center",
  },
  translateButtonDisabled: {
    opacity: 0.45,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  translateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#42A86B",
    marginRight: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: "#656B75",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E0E3E8",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#17191D",
    borderRadius: 3,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    minHeight: 145,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  resultText: {
    fontSize: 20,
    lineHeight: 29,
    color: "#17191D",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8A8F98",
  },
  footer: {
    alignItems: "center",
    marginTop: 22,
  },
  footerText: {
    fontSize: 11,
    color: "#8A8F98",
    textAlign: "center",
  },
});


























