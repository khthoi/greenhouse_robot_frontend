// app/alert-logs/alert_logs_page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

// === INTERFACES (giữ nguyên) ===
interface Alert {
  alert_id: number;
  alert_type: string;
  measured_value: number;
  reference_value: number;
  threshold: number;
  message: string;
  measurement_number: number;
  created_at: string;
}

interface RFIDTag {
  rfid_tag_id: number;
  uid: string;
  location_name: string;
  reference_temperature: number;
  reference_humidity: number;
}

interface WorkPlan {
  work_plan_id: number;
  description: string;
  status: string;
  temp_threshold: number;
  hum_threshold: number;
  violation_count: number;
  created_at?: string;
}

interface RFIDAlertGroup {
  rfid_tag: RFIDTag;
  alerts: Alert[];
}

interface AlertLogTree {
  work_plan: WorkPlan;
  rfid_tags: RFIDAlertGroup[];
}

export default function AlertLogPage() {
  const [alertLogs, setAlertLogs] = useState<AlertLogTree[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  const [expandedRfids, setExpandedRfids] = useState<Record<number, number[]>>({});

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const limit = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/alert-logs?page=${currentPage}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();

        const planMap = new Map<number, AlertLogTree>();

        (json.data || []).forEach((item: any) => {
          // BẢO VỆ: work_plan
          if (!item.work_plan || !item.work_plan.work_plan_id) return;

          const planId = item.work_plan.work_plan_id;

          // Tạo plan nếu chưa có
          if (!planMap.has(planId)) {
            planMap.set(planId, {
              work_plan: {
                work_plan_id: item.work_plan.work_plan_id,
                description: item.work_plan.description || 'Không có mô tả',
                status: item.work_plan.status || 'UNKNOWN',
                temp_threshold: item.work_plan.temp_threshold || 0,
                hum_threshold: item.work_plan.hum_threshold || 0,
                violation_count: item.work_plan.violation_count || 0,
                created_at: item.work_plan.created_at || '',
              },
              rfid_tags: [],
            });
          }

          const planEntry = planMap.get(planId)!;

          // ĐỌC MẢNG rfid_tags (cấu trúc mới)
          if (Array.isArray(item.rfid_tags)) {
            item.rfid_tags.forEach((group: any) => {
              if (!group.rfid_tag || !group.rfid_tag.rfid_tag_id) return;

              const rfidId = group.rfid_tag.rfid_tag_id;

              // Tìm hoặc tạo RFID group
              let rfidGroup = planEntry.rfid_tags.find(g => g.rfid_tag.rfid_tag_id === rfidId);
              if (!rfidGroup) {
                rfidGroup = {
                  rfid_tag: {
                    rfid_tag_id: group.rfid_tag.rfid_tag_id,
                    uid: group.rfid_tag.uid || 'UNKNOWN',
                    location_name: group.rfid_tag.location_name || 'Không rõ',
                    reference_temperature: group.rfid_tag.reference_temperature || 0,
                    reference_humidity: group.rfid_tag.reference_humidity || 0,
                  },
                  alerts: [],
                };
                planEntry.rfid_tags.push(rfidGroup);
              }

              // Thêm alerts
              if (Array.isArray(group.alerts)) {
                rfidGroup.alerts.push(
                  ...group.alerts.map((a: any) => ({
                    alert_id: a.alert_id,
                    alert_type: a.alert_type || 'UNKNOWN',
                    measured_value: a.measured_value ?? 0,
                    reference_value: a.reference_value ?? 0,
                    threshold: a.threshold ?? 0,
                    message: a.message || '',
                    measurement_number: a.measurement_number ?? 0,
                    created_at: a.created_at || '',
                  }))
                );
              }
            });
          }
        });

        setAlertLogs(Array.from(planMap.values()));
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error('Lỗi fetch:', err);
        setAlertLogs([]);
        setTotalPages(1);
      }
    };
    fetchData();
  }, [currentPage, apiUrl]);

  // === CÁC HÀM GIÚP ĐỠ (giữ nguyên) ===
  const togglePlan = (planId: number) => {
    setExpandedPlans(prev => {
      const next = new Set(prev);
      next.has(planId) ? next.delete(planId) : next.add(planId);
      return next;
    });
  };

  const toggleRfid = (planId: number, rfidId: number) => {
    setExpandedRfids(prev => {
      const next = { ...prev };
      const current = next[planId] || [];

      if (current.includes(rfidId)) {
        // Đóng: loại bỏ rfidId
        next[planId] = current.filter(id => id !== rfidId);
      } else {
        // Mở: thêm rfidId
        next[planId] = [...current, rfidId];
      }

      // Xóa nếu không còn RFID nào mở
      if (next[planId].length === 0) {
        delete next[planId];
      }

      return next;
    });
  };

  const handlePageChange = (_: any, value: number) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  const getAlertTypeInfo = (type: string) => {
    switch (type) {
      case 'TEMP_HIGH': return { icon: 'fa-temperature-arrow-up', color: 'text-danger', bg: 'bg-danger', text: 'Nhiệt độ cao' };
      case 'TEMP_LOW': return { icon: 'fa-temperature-arrow-down', color: 'text-info', bg: 'bg-info', text: 'Nhiệt độ thấp' };
      case 'HUM_HIGH': return { icon: 'fa-droplet', color: 'text-primary', bg: 'bg-primary', text: 'Độ ẩm cao' };
      case 'HUM_LOW': return { icon: 'fa-droplet-slash', color: 'text-warning', bg: 'bg-warning', text: 'Độ ẩm thấp' };
      default: return { icon: 'fa-exclamation-triangle', color: 'text-secondary', bg: 'bg-secondary', text: type };
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      COMPLETED: { bg: 'bg-success', text: 'Hoàn thành' },
      IN_PROGRESS: { bg: 'bg-primary', text: 'Đang thực hiện' },
      RECEIVED: { bg: 'bg-secondary', text: 'Đã nhận' },
      NOT_RECEIVED: { bg: 'bg-warning', text: 'Chưa nhận' },
      FAILED: { bg: 'bg-danger', text: 'Thất bại' },
    };
    return map[status] || { bg: 'bg-secondary', text: status };
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const stats = useMemo(() => {
    if (!Array.isArray(alertLogs)) return { total: 0, TEMP_HIGH: 0, TEMP_LOW: 0, HUM_HIGH: 0, HUM_LOW: 0 };
    let total = 0;
    const types = { TEMP_HIGH: 0, TEMP_LOW: 0, HUM_HIGH: 0, HUM_LOW: 0 };
    alertLogs.forEach(log => {
      log.rfid_tags.forEach(group => {
        total += group.alerts.length;
        group.alerts.forEach(alert => {
          if (types.hasOwnProperty(alert.alert_type)) {
            types[alert.alert_type as keyof typeof types]++;
          }
        });
      });
    });
    return { total, ...types };
  }, [alertLogs]);

  // === RENDER (giữ nguyên) ===
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-bell me-3"></i>
          Nhật ký cảnh báo
        </h2>
      </div>

      <div className="row g-3 mt-3 mb-4">
        {[
          { label: 'Tổng cảnh báo', value: stats.total, icon: 'fa-bell', color: 'secondary' },
          { label: 'Nhiệt độ cao', value: stats.TEMP_HIGH, icon: 'fa-temperature-arrow-up', color: 'danger' },
          { label: 'Nhiệt độ thấp', value: stats.TEMP_LOW, icon: 'fa-temperature-arrow-down', color: 'info' },
          { label: 'Độ ẩm cao', value: stats.HUM_HIGH, icon: 'fa-droplet', color: 'primary' },
          { label: 'Độ ẩm thấp', value: stats.HUM_LOW, icon: 'fa-droplet-slash', color: 'warning' },
        ].map((stat, i) => (
          <div key={i} className="col-lg-2 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">{stat.label}</small>
                  <h4 className={`mb-0 mt-1 text-${stat.color}`}>{stat.value}</h4>
                </div>
                <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                  <i className={`fas ${stat.icon} fa-2x text-${stat.color}`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {alertLogs.length === 0 ? (
          <div className="data-card text-center py-5">
            <p className="text-muted">Chưa có cảnh báo nào</p>
          </div>
        ) : (
          <div className="row g-4">
            {alertLogs.map((log) => {
              const plan = log.work_plan;
              const isPlanOpen = expandedPlans.has(plan.work_plan_id);
              const totalAlerts = log.rfid_tags.reduce((s, g) => s + g.alerts.length, 0);
              const totalLocations = log.rfid_tags.length;

              return (
                <div key={plan.work_plan_id} className="col-12">
                  <div className="data-card">
                    <div
                      className="data-card-header d-flex justify-content-between align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => togglePlan(plan.work_plan_id)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <i className={`fas fa-chevron-${isPlanOpen ? 'down' : 'right'} text-primary`}></i>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className="fas fa-clipboard-list text-success"></i>
                            <h5 className="mb-0">{plan.description}</h5>
                            <span className={`badge ${getStatusBadge(plan.status).bg} ms-2`}>
                              {getStatusBadge(plan.status).text}
                            </span>
                          </div>

                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1 text-info"></i>
                            {totalLocations} vị trí &nbsp;•&nbsp;
                            <i className="fas fa-exclamation-triangle me-1 text-danger"></i>
                            {totalAlerts} cảnh báo
                          </small>

                          <p className="mb-0 text-muted">
                            <i className="fas fa-clock me-1 text-secondary"></i>
                            Thời gian tạo:{' '}
                            {plan.created_at
                              ? new Date(plan.created_at).toLocaleString('vi-VN')
                              : 'Không xác định'}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Ngưỡng: ±{plan.temp_threshold}°C, ±{plan.hum_threshold}%</small>
                        <small className="text-muted d-block">Tối đa: {plan.violation_count} lần vi phạm</small>
                      </div>
                    </div>

                    {isPlanOpen && (
                      <div className="p-3 bg-light-subtle">
                        {log.rfid_tags.map((group) => {
                          const rfid = group.rfid_tag;
                          const alerts = group.alerts;
                          const isRfidOpen = (expandedRfids[plan.work_plan_id] || []).includes(rfid.rfid_tag_id);

                          return (
                            <div key={rfid.rfid_tag_id} className="border-start border-3 border-primary ps-3 mb-3">
                              <div
                                className="d-flex align-items-center gap-2 mb-2"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRfid(plan.work_plan_id, rfid.rfid_tag_id);
                                }}
                              >
                                <i className={`fas fa-chevron-${isRfidOpen ? 'down' : 'right'} text-primary`}></i>
                                <i className="fas fa-id-card text-primary"></i>
                                <strong>{rfid.uid}</strong>
                                <span className="text-muted">- {rfid.location_name}</span>
                                <span className="badge bg-danger ms-2">{alerts.length} cảnh báo</span>
                              </div>

                              {isRfidOpen && alerts.length > 0 && (
                                <div className="table-responsive ms-4 mt-2">
                                  <table className="table table-sm table-hover align-middle">
                                    <thead className="table-light">
                                      <tr>
                                        <th>#</th>
                                        <th>Loại</th>
                                        <th>Lần đo</th>
                                        <th className="text-center">Đo được</th>
                                        <th className="text-center">Chuẩn</th>
                                        <th className="text-center">Ngưỡng</th>
                                        <th className="text-center">Lệch</th>
                                        <th className="text-center">Thời gian</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {alerts.map((alert) => {
                                        const info = getAlertTypeInfo(alert.alert_type);
                                        const deviation = Math.abs(alert.measured_value - alert.reference_value);
                                        const isTemp = alert.alert_type.includes('TEMP');

                                        return (
                                          <tr key={alert.alert_id}>
                                            <td><span className="badge bg-secondary">{alert.alert_id}</span></td>
                                            <td>
                                              <div className="d-flex align-items-center gap-1">
                                                <i className={`fas ${info.icon} ${info.color} fa-xs`}></i>
                                                <small className={info.color}>{info.text}</small>
                                              </div>
                                            </td>
                                            <td><span className="badge bg-info">Lần {alert.measurement_number}</span></td>
                                            <td className="text-center">
                                              <strong className={info.color}>
                                                {alert.measured_value}{isTemp ? '°C' : '%'}
                                              </strong>
                                            </td>
                                            <td className="text-center text-muted">
                                              {alert.reference_value}{isTemp ? '°C' : '%'}
                                            </td>
                                            <td className="text-center text-muted">
                                              ±{alert.threshold}{isTemp ? '°C' : '%'}
                                            </td>
                                            <td className="text-center">
                                              <span className={`badge ${info.bg} bg-opacity-75`}>
                                                {deviation.toFixed(1)}
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              <small className="text-muted">
                                                {formatDateTime(alert.created_at)}
                                              </small>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  <div className="text-end mt-2">
                                    <small className="text-muted">
                                      Tổng: <strong>{alerts.length}</strong> cảnh báo tại vị trí này
                                    </small>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center mt-5 mb-3">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            size="large"
            showFirstButton
            showLastButton
          />
        </Stack>
      </div>
    </div>
  );
}