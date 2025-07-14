import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, Users, Building2, MapPin, TrendingUp, DollarSign, Calendar, Settings, RefreshCw, Eye, CreditCard as Edit, Trash2, Plus } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { useCompanies } from '../../hooks/useCompanies';
import { useProvinces } from '../../hooks/useProvinces';
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatCurrency } from '../../utils/currency';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  navigation: any;
}

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalProvinces: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export default function AdminDashboard({ navigation }: AdminDashboardProps) {
  const { companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const { provinces, loading: provincesLoading } = useProvinces();
  const { profile } = useUserProfile();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalProvinces: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  });
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'users' | 'analytics'>('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'company' | 'user' | 'province'>('company');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, [companies, provinces]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const loadDashboardStats = () => {
    // Simular datos del dashboard
    setStats({
      totalUsers: 1247,
      totalCompanies: companies.length,
      totalProvinces: provinces.length,
      totalRevenue: 2450000,
      activeUsers: 892,
      newUsersThisMonth: 156,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchCompanies();
      loadDashboardStats();
      showToast('Datos actualizados correctamente');
    } catch (error) {
      showToast('Error al actualizar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCompany = () => {
    navigation.navigate('CompanyForm', { mode: 'create' });
  };

  const handleEditCompany = (company: any) => {
    navigation.navigate('CompanyForm', { 
      mode: 'edit', 
      companyId: company.id 
    });
  };

  const handleDeleteCompany = (company: any) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar "${company.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteCompany(company.id)
        }
      ]
    );
  };

  const deleteCompany = async (companyId: number) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      showToast('Empresa eliminada correctamente');
      refetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      showToast('Error al eliminar la empresa');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[globalStyles.card, styles.statCard]}>
          <Users size={24} color={colors.brandGold} />
          <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Usuarios Totales</Text>
          <Text style={styles.statChange}>+{stats.newUsersThisMonth} este mes</Text>
        </View>

        <View style={[globalStyles.card, styles.statCard]}>
          <Building2 size={24} color={colors.brandGold} />
          <Text style={styles.statNumber}>{stats.totalCompanies}</Text>
          <Text style={styles.statLabel}>Empresas</Text>
          <Text style={styles.statChange}>Activas</Text>
        </View>

        <View style={[globalStyles.card, styles.statCard]}>
          <MapPin size={24} color={colors.brandGold} />
          <Text style={styles.statNumber}>{stats.totalProvinces}</Text>
          <Text style={styles.statLabel}>Provincias</Text>
          <Text style={styles.statChange}>Disponibles</Text>
        </View>

        <View style={[globalStyles.card, styles.statCard]}>
          <DollarSign size={24} color={colors.brandGold} />
          <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
          <Text style={styles.statChange}>Este mes</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={[globalStyles.card, styles.activityCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Actividad Reciente</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <RefreshCw size={20} color={colors.brandGold} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Users size={16} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Nuevo usuario registrado</Text>
              <Text style={styles.activityTime}>Hace 5 minutos</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Building2 size={16} color={colors.brandGold} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Nueva empresa agregada</Text>
              <Text style={styles.activityTime}>Hace 1 hora</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <DollarSign size={16} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Provincia activada</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[globalStyles.card, styles.quickActionsCard]}>
        <Text style={styles.cardTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleCreateCompany}
          >
            <Plus size={20} color={colors.brandDark} />
            <Text style={styles.quickActionText}>Nueva Empresa</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => showToast('Función de nuevo usuario en desarrollo')}
          >
            <Plus size={20} color={colors.brandDark} />
            <Text style={styles.quickActionText}>Nuevo Usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setSelectedTab('analytics')}
          >
            <BarChart3 size={20} color={colors.brandDark} />
            <Text style={styles.quickActionText}>Ver Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => showToast('Función de configuración en desarrollo')}
          >
            <Settings size={20} color={colors.brandDark} />
            <Text style={styles.quickActionText}>Configuración</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCompaniesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Gestión de Empresas</Text>
        <Button
          title="Nueva Empresa"
          onPress={handleCreateCompany}
          icon={<Plus size={16} color={colors.brandDark} />}
          style={styles.addButton}
        />
      </View>

      {companies.map(company => (
        <View key={company.id} style={[globalStyles.card, styles.listItem]}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{company.name}</Text>
            <Text style={styles.itemSubtitle}>
              {company.location?.location.description || 'Sin ubicación'}
            </Text>
            <Text style={styles.itemDescription}>
              {company.short_description || 'Sin descripción'}
            </Text>
            <View style={styles.itemTags}>
              {company.with_delivery && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Delivery</Text>
                </View>
              )}
              {company.with_reservation && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Reservas</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EstablishmentDetail', { id: company.id })}
            >
              <Eye size={16} color={colors.brandGold} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditCompany(company)}
            >
              <Edit size={16} color={colors.brandGold} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteCompany(company)}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderUsersTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Gestión de Usuarios</Text>
        <Button
          title="Nuevo Usuario"
          onPress={() => showToast('Función de nuevo usuario en desarrollo')}
          icon={<Plus size={16} color={colors.brandDark} />}
          style={styles.addButton}
        />
      </View>

      {/* Usuarios simulados */}
      {[
        { id: 1, name: 'Juan Pérez', email: 'juan@email.com', city: 'Córdoba', active: true },
        { id: 2, name: 'María García', email: 'maria@email.com', city: 'Buenos Aires', active: true },
        { id: 3, name: 'Carlos López', email: 'carlos@email.com', city: 'Rosario', active: false },
        { id: 4, name: 'Ana Martínez', email: 'ana@email.com', city: 'Mendoza', active: true },
      ].map(user => (
        <View key={user.id} style={[globalStyles.card, styles.listItem]}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{user.name}</Text>
            <Text style={styles.itemSubtitle}>{user.email}</Text>
            <Text style={styles.itemDescription}>{user.city}</Text>
            <View style={styles.itemTags}>
              <View style={[styles.tag, { backgroundColor: user.active ? colors.success : colors.error }]}>
                <Text style={styles.tagText}>{user.active ? 'Activo' : 'Inactivo'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => showToast(`Ver perfil de ${user.name}`)}
            >
              <Eye size={16} color={colors.brandGold} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => showToast(`Editar ${user.name}`)}
            >
              <Edit size={16} color={colors.brandGold} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => showToast(`Eliminar ${user.name}`)}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Analytics y Reportes</Text>
      
      {/* Gráfico simulado */}
      <View style={[globalStyles.card, styles.chartCard]}>
        <Text style={styles.cardTitle}>Usuarios Activos por Mes</Text>
        <View style={styles.chartPlaceholder}>
          <BarChart3 size={60} color={colors.brandGold} />
          <Text style={styles.chartText}>Gráfico de barras</Text>
          <Text style={styles.chartSubtext}>Datos de los últimos 6 meses</Text>
        </View>
      </View>

      {/* Métricas adicionales */}
      <View style={[globalStyles.card, styles.metricsCard]}>
        <Text style={styles.cardTitle}>Métricas Clave</Text>
        <View style={styles.metricsList}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Tasa de conversión</Text>
            <Text style={styles.metricValue}>12.5%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Retención de usuarios</Text>
            <Text style={styles.metricValue}>78%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Ingresos por usuario</Text>
            <Text style={styles.metricValue}>{formatCurrency(15000)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Crecimiento mensual</Text>
            <Text style={styles.metricValue}>+8.2%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'companies':
        return renderCompaniesTab();
      case 'users':
        return renderUsersTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <RefreshCw 
              size={24} 
              color={refreshing ? colors.brandGray : colors.brandGold} 
            />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <BarChart3 size={20} color={selectedTab === 'overview' ? colors.brandDark : colors.brandGray} />
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              Resumen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'companies' && styles.activeTab]}
            onPress={() => setSelectedTab('companies')}
          >
            <Building2 size={20} color={selectedTab === 'companies' ? colors.brandDark : colors.brandGray} />
            <Text style={[styles.tabText, selectedTab === 'companies' && styles.activeTabText]}>
              Empresas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'users' && styles.activeTab]}
            onPress={() => setSelectedTab('users')}
          >
            <Users size={20} color={selectedTab === 'users' ? colors.brandDark : colors.brandGray} />
            <Text style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>
              Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'analytics' && styles.activeTab]}
            onPress={() => setSelectedTab('analytics')}
          >
            <TrendingUp size={20} color={selectedTab === 'analytics' ? colors.brandDark : colors.brandGray} />
            <Text style={[styles.tabText, selectedTab === 'analytics' && styles.activeTabText]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.brandDarkSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandGold,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.brandDarkSecondary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.brandGold,
  },
  tabText: {
    fontSize: 12,
    color: colors.brandGray,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.brandDark,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.brandGray,
    textAlign: 'center',
  },
  statChange: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  activityCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.brandLight,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: colors.brandGray,
    marginTop: 2,
  },
  quickActionsCard: {
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.brandGold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandDark,
    marginLeft: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.brandGray,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.brandGray,
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.brandGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brandDark,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.brandDark,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandDark,
    borderRadius: 8,
    marginTop: 16,
  },
  chartText: {
    fontSize: 16,
    color: colors.brandLight,
    marginTop: 8,
  },
  chartSubtext: {
    fontSize: 12,
    color: colors.brandGray,
    marginTop: 4,
  },
  metricsCard: {
    marginBottom: 16,
  },
  metricsList: {
    marginTop: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandDark,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.brandGray,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandLight,
  },
});