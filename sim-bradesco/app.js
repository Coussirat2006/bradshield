import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  deleteSafeNumber,
  listSafeNumbers,
  saveSafeNumber,
  testConnection,
  verifyNumber,
} from "./src/api/bradshieldApi";

const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_BRADSHIELD_API_URL ||
  Platform.select({
    android: "http://10.0.2.2:5189",
    ios: "http://localhost:5189",
    default: "http://localhost:5189",
  });

const tabs = [
  { id: "verify", label: "Verificar", glyph: "?" },
  { id: "safe", label: "Seguros", glyph: "+" },
  { id: "settings", label: "Conexão", glyph: "•" },
];

const statusLabels = {
  seguro: "Seguro",
  suspeito: "Suspeito",
  fraudulento: "Fraudulento",
  desconhecido: "Desconhecido",
};

const statusPalette = {
  seguro: {
    background: "#e8f7f2",
    border: "#8ed8bf",
    text: "#006c53",
    accent: "#007c7a",
  },
  suspeito: {
    background: "#fff6e6",
    border: "#ffd386",
    text: "#8a5700",
    accent: "#ad6b00",
  },
  fraudulento: {
    background: "#fff1f3",
    border: "#f4a7b0",
    text: "#9c1019",
    accent: "#ec2630",
  },
  desconhecido: {
    background: "#eef3f6",
    border: "#c7d0d8",
    text: "#47525d",
    accent: "#68727d",
  },
};

function nowLabel(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeSafeNumber(item) {
  return {
    id: item.id ?? item.Id,
    numeroTelefone: item.numeroTelefone ?? item.NumeroTelefone,
    instituicao: item.instituicao ?? item.Instituicao,
    instituicaoId: item.instituicaoId ?? item.InstituicaoId,
    seguro: item.seguro ?? item.Seguro ?? true,
  };
}

function StatusPill({ status }) {
  const safeStatus = statusPalette[status] ? status : "desconhecido";
  const palette = statusPalette[safeStatus];

  return (
    <View style={[styles.statusPill, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <Text style={[styles.statusPillText, { color: palette.text }]}>{statusLabels[safeStatus]}</Text>
    </View>
  );
}

function PrimaryButton({ children, onPress, loading = false, variant = "primary", style }) {
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        isDanger && styles.dangerButton,
        !isSecondary && !isDanger && styles.primaryButton,
        pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={isSecondary ? colors.ink : colors.surface} /> : null}
      <Text
        style={[
          styles.buttonText,
          isSecondary && styles.secondaryButtonText,
          isDanger && styles.dangerButtonText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", autoCapitalize = "none" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8a949f"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function SafeNumberCard({ item, onEdit, onDelete }) {
  return (
    <View style={styles.safeCard}>
      <View style={styles.safeCardMain}>
        <Text style={styles.safeNumber}>{item.numeroTelefone}</Text>
        <Text style={styles.safeInstitution}>{item.instituicao}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable accessibilityRole="button" onPress={onEdit} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDelete} style={[styles.actionButton, styles.removeButton]}>
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remover</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({ title, message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export default function App() {
  const noticeTimer = useRef(null);
  const [activeTab, setActiveTab] = useState("verify");
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_URL);
  const [numberToCheck, setNumberToCheck] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [safeNumbers, setSafeNumbers] = useState([]);
  const [safeQuery, setSafeQuery] = useState("");
  const [safeNumberInput, setSafeNumberInput] = useState("");
  const [institutionInput, setInstitutionInput] = useState("");
  const [editingNumber, setEditingNumber] = useState(null);
  const [connectionResult, setConnectionResult] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingSafeNumbers, setLoadingSafeNumbers] = useState(false);
  const [savingSafeNumber, setSavingSafeNumber] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const filteredSafeNumbers = useMemo(() => {
    const query = safeQuery.trim().toLowerCase();

    if (!query) {
      return safeNumbers;
    }

    return safeNumbers.filter((item) => {
      return (
        item.numeroTelefone.toLowerCase().includes(query) ||
        item.instituicao.toLowerCase().includes(query)
      );
    });
  }, [safeNumbers, safeQuery]);

  useEffect(() => {
    loadSafeNumbers();

    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  function showNotice(type, message) {
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }

    setNotice({ type, message });
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }

  async function loadSafeNumbers() {
    setLoadingSafeNumbers(true);

    try {
      const payload = await listSafeNumbers(apiBaseUrl);
      setSafeNumbers(payload.map(normalizeSafeNumber));
    } catch (error) {
      showNotice("error", error.message || "Não foi possível carregar os números seguros.");
    } finally {
      setLoadingSafeNumbers(false);
    }
  }

  async function handleVerify() {
    const number = numberToCheck.trim();

    if (!number) {
      showNotice("error", "Digite um número para verificar.");
      return;
    }

    setLoadingVerify(true);

    try {
      const verification = await verifyNumber(apiBaseUrl, number);
      setResult(verification);
      setHistory((items) => [verification, ...items].slice(0, 6));
    } catch (error) {
      const fallback = {
        numero: number,
        status: "desconhecido",
        statusApi: "Erro",
        mensagem: error.message || "Não foi possível conectar ao servidor.",
        instituicao: null,
        seguro: false,
        checkedAt: new Date().toISOString(),
      };

      setResult(fallback);
      setHistory((items) => [fallback, ...items].slice(0, 6));
      showNotice("error", fallback.mensagem);
    } finally {
      setLoadingVerify(false);
    }
  }

  async function handleSaveSafeNumber() {
    const numeroTelefone = safeNumberInput.trim();
    const instituicao = institutionInput.trim();

    if (!numeroTelefone || !instituicao) {
      showNotice("error", "Informe número e instituição.");
      return;
    }

    setSavingSafeNumber(true);

    try {
      const saved = await saveSafeNumber(
        apiBaseUrl,
        { numeroTelefone, instituicao },
        editingNumber?.id,
      );
      const normalized = normalizeSafeNumber(saved);

      setSafeNumbers((items) => {
        if (!editingNumber) {
          return [normalized, ...items];
        }

        return items.map((item) => (item.id === normalized.id ? normalized : item));
      });

      setSafeNumberInput("");
      setInstitutionInput("");
      setEditingNumber(null);
      showNotice("success", editingNumber ? "Número seguro atualizado." : "Número seguro cadastrado.");
    } catch (error) {
      showNotice("error", error.message || "Não foi possível salvar o número seguro.");
    } finally {
      setSavingSafeNumber(false);
    }
  }

  function startEditSafeNumber(item) {
    setEditingNumber(item);
    setSafeNumberInput(item.numeroTelefone);
    setInstitutionInput(item.instituicao);
  }

  function cancelEditSafeNumber() {
    setEditingNumber(null);
    setSafeNumberInput("");
    setInstitutionInput("");
  }

  function confirmDeleteSafeNumber(item) {
    Alert.alert("Remover número seguro", `Remover ${item.numeroTelefone} da base oficial?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => handleDeleteSafeNumber(item),
      },
    ]);
  }

  async function handleDeleteSafeNumber(item) {
    try {
      await deleteSafeNumber(apiBaseUrl, item.id);
      setSafeNumbers((items) => items.filter((safeNumber) => safeNumber.id !== item.id));
      showNotice("success", "Número seguro removido.");
    } catch (error) {
      showNotice("error", error.message || "Não foi possível remover o número seguro.");
    }
  }

  async function handleTestConnection() {
    setTestingConnection(true);

    try {
      const response = await testConnection(apiBaseUrl);
      setConnectionResult({ status: response.ok ? "seguro" : "desconhecido", message: response.message });
      showNotice("success", response.message);
    } catch (error) {
      setConnectionResult({ status: "desconhecido", message: error.message || "Falha na conexão com a API." });
      showNotice("error", error.message || "Falha na conexão com a API.");
    } finally {
      setTestingConnection(false);
    }
  }

  function renderVerify() {
    const palette = statusPalette[result?.status || "desconhecido"];

    return (
      <>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Consulta de canal</Text>
          <Field
            keyboardType="phone-pad"
            label="Número"
            onChangeText={setNumberToCheck}
            placeholder="0800-591-2117"
            value={numberToCheck}
          />
          <PrimaryButton loading={loadingVerify} onPress={handleVerify} style={styles.fullButton}>
            Verificar número
          </PrimaryButton>
        </View>

        {result ? (
          <View style={[styles.resultCard, { backgroundColor: palette.background, borderColor: palette.border }]}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIdentity}>
                <Text style={[styles.resultNumber, { color: palette.text }]}>{result.numero}</Text>
                {result.instituicao ? <Text style={styles.resultInstitution}>{result.instituicao}</Text> : null}
              </View>
              <StatusPill status={result.status} />
            </View>
            <Text style={[styles.resultMessage, { color: palette.text }]}>{result.mensagem}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verificações recentes</Text>
        </View>

        {history.length ? (
          <View style={styles.historyList}>
            {history.map((item, index) => (
              <View key={`${item.numero}-${item.checkedAt}-${index}`} style={styles.historyRow}>
                <View style={styles.historyMain}>
                  <Text style={styles.historyNumber}>{item.numero}</Text>
                  <Text style={styles.historyMeta}>{nowLabel(item.checkedAt)}</Text>
                </View>
                <StatusPill status={item.status} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="Sem consultas" message="As verificações desta sessão aparecerão aqui." />
        )}
      </>
    );
  }

  function renderSafeNumbers() {
    return (
      <>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{editingNumber ? "Editar número seguro" : "Novo número seguro"}</Text>
          <Field
            keyboardType="phone-pad"
            label="Número"
            onChangeText={setSafeNumberInput}
            placeholder="0800-000-0000"
            value={safeNumberInput}
          />
          <Field
            autoCapitalize="words"
            label="Instituição"
            onChangeText={setInstitutionInput}
            placeholder="Banco Bradesco Oficial"
            value={institutionInput}
          />
          <View style={styles.formActions}>
            <PrimaryButton loading={savingSafeNumber} onPress={handleSaveSafeNumber} style={styles.formButton}>
              {editingNumber ? "Salvar" : "Cadastrar"}
            </PrimaryButton>
            {editingNumber ? (
              <PrimaryButton onPress={cancelEditSafeNumber} variant="secondary" style={styles.formButton}>
                Cancelar
              </PrimaryButton>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Números seguros</Text>
          <Pressable accessibilityRole="button" onPress={loadSafeNumbers} style={styles.inlineButton}>
            <Text style={styles.inlineButtonText}>{loadingSafeNumbers ? "Atualizando" : "Atualizar"}</Text>
          </Pressable>
        </View>

        <Field
          label="Buscar"
          onChangeText={setSafeQuery}
          placeholder="Número ou instituição"
          value={safeQuery}
        />

        {loadingSafeNumbers && !safeNumbers.length ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : filteredSafeNumbers.length ? (
          <View style={styles.safeList}>
            {filteredSafeNumbers.map((item) => (
              <SafeNumberCard
                item={item}
                key={item.id}
                onDelete={() => confirmDeleteSafeNumber(item)}
                onEdit={() => startEditSafeNumber(item)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="Nenhum número" message="A base sincronizada não retornou itens para esta busca." />
        )}
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>API BradShield</Text>
          <Field
            autoCapitalize="none"
            label="URL base"
            onChangeText={setApiBaseUrl}
            placeholder="http://localhost:5189"
            value={apiBaseUrl}
          />
          <PrimaryButton loading={testingConnection} onPress={handleTestConnection} style={styles.fullButton}>
            Testar conexão
          </PrimaryButton>
        </View>

        {connectionResult ? (
          <View style={styles.connectionCard}>
            <StatusPill status={connectionResult.status} />
            <Text style={styles.connectionMessage}>{connectionResult.message}</Text>
          </View>
        ) : null}

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Verificação</Text>
            <Text style={styles.infoValue}>/api/verificacao/checar</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Canais</Text>
            <Text style={styles.infoValue}>/api/canais</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Gestão</Text>
            <Text style={styles.infoValue}>/api/numeros-seguros</Text>
          </View>
        </View>
      </>
    );
  }

  function renderContent() {
    if (activeTab === "safe") {
      return renderSafeNumbers();
    }

    if (activeTab === "settings") {
      return renderSettings();
    }

    return renderVerify();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>B</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.appName}>BradShield</Text>
              <Text style={styles.appSubtitle}>Canais oficiais sincronizados</Text>
            </View>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.tabGlyph, active && styles.tabGlyphActive]}>{tab.glyph}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content} contentContainerStyle={styles.body}>
            {renderContent()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {notice ? (
        <View
          pointerEvents="none"
          style={[styles.notice, notice.type === "error" ? styles.noticeError : styles.noticeSuccess]}
        >
          <Text style={styles.noticeText}>{notice.message}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const colors = {
  background: "#f8fafb",
  brand: "#ec2630",
  brandDark: "#c7141e",
  ink: "#172026",
  muted: "#68727d",
  line: "#dde3e8",
  surface: "#ffffff",
  soft: "#f3f6f8",
  success: "#007c7a",
  dangerSoft: "#fff1f3",
};

const shadow = {
  shadowColor: "#172026",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 3,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  shell: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 760,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  brandMark: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.brand,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "900",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  appName: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
  },
  appSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  tabActive: {
    borderColor: colors.brand,
    backgroundColor: colors.dangerSoft,
  },
  tabGlyph: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "900",
  },
  tabGlyphActive: {
    color: colors.brand,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: colors.brand,
  },
  content: {
    flex: 1,
  },
  body: {
    gap: 18,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  panel: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    ...shadow,
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.brand,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
  },
  dangerButton: {
    backgroundColor: colors.dangerSoft,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: colors.ink,
  },
  dangerButtonText: {
    color: colors.brand,
  },
  fullButton: {
    width: "100%",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
  },
  formButton: {
    flex: 1,
  },
  resultCard: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  resultIdentity: {
    flex: 1,
    minWidth: 0,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: "900",
  },
  resultInstitution: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  resultMessage: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  statusPill: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  inlineButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  inlineButtonText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "900",
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  historyMain: {
    flex: 1,
    minWidth: 0,
  },
  historyNumber: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  historyMeta: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  safeList: {
    gap: 10,
  },
  safeCard: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  safeCardMain: {
    gap: 4,
  },
  safeNumber: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  safeInstitution: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.soft,
  },
  actionButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  removeButton: {
    backgroundColor: colors.dangerSoft,
  },
  removeButtonText: {
    color: colors.brand,
  },
  loadingBox: {
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  emptyState: {
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  connectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  connectionMessage: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  infoGrid: {
    gap: 10,
  },
  infoCard: {
    gap: 5,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  infoValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  notice: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    alignSelf: "center",
    maxWidth: 460,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  noticeSuccess: {
    backgroundColor: "#11181d",
  },
  noticeError: {
    backgroundColor: colors.brandDark,
  },
  noticeText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.72,
  },
});
