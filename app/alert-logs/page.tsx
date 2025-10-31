'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

interface Alert {
  alert_id: number;
  alert_type: string;
  measured_value: number;
  reference_value: number;
  threshold: number;
  message: string;
  timestamp: string;
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
}

interface AlertLog {
  work_plan: WorkPlan;
  rfid_tag: RFIDTag;
  alerts: Alert[];
}

export default function AlertLogPage() {
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedRfidInPlan, setExpandedRfidInPlan] = useState<Record<number, number | null>>({});

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const limit = 15;

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/alert-logs?page=${currentPage}&limit=${limit}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setAlertLogs(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error('Lỗi fetch alert logs:', err);
        setAlertLogs([]);
        setTotalPages(1);
      }
    };
    fetchData();
  }, [currentPage, apiUrl]);

  const togglePlan = (key: string) => {
    setExpandedPlanId(prev => (prev === key ? null : key));
  };

  // Toggle mở rộng RFID trong kế hoạch
  const toggleRfid = (planId: number, rfidId: number) => {
    setExpandedRfidInPlan(prev => ({
      ...prev,
      [planId]: prev[planId] === rfidId ? null : rfidId
    }));
  };

  // Xử lý phân trang
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Helper functions
  const getAlertTypeInfo = (alertType: string) => {
    switch (alertType) {
      case 'TEMP_HIGH':
        return { icon: 'fa-temperature-arrow-up', color: 'text-danger', bgColor: 'bg-danger', text: 'Nhiệt độ cao' };
      case 'TEMP_LOW':
        return { icon: 'fa-temperature-arrow-down', color: 'text-info', bgColor: 'bg-info', text: 'Nhiệt độ thấp' };
      case 'HUM_HIGH':
        return { icon: 'fa-droplet', color: 'text-primary', bgColor: 'bg-primary', text: 'Độ ẩm cao' };
      case 'HUM_LOW':
        return { icon: 'fa-droplet-slash', color: 'text-warning', bgColor: 'bg-warning', text: 'Độ ẩm thấp' };
      default:
        return { icon: 'fa-exclamation-triangle', color: 'text-secondary', bgColor: 'bg-secondary', text: alertType };
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'RECEIVED': return 'bg-secondary';
      case 'NOT_RECEIVED': return 'bg-warning';
      case 'FAILED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'RECEIVED': return 'Đã nhận';
      case 'NOT_RECEIVED': return 'Chưa nhận';
      case 'FAILED': return 'Đã thất bại';
      default: return status;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  const getTotalAlerts = () => {
    return alertLogs.reduce((total, log) => total + log.alerts.length, 0);
  };

  const getAlertsByType = () => {
    const counts = { TEMP_HIGH: 0, TEMP_LOW: 0, HUM_HIGH: 0, HUM_LOW: 0 };
    alertLogs.forEach(log => {
      log.alerts.forEach(alert => {
        if (counts.hasOwnProperty(alert.alert_type)) {
          counts[alert.alert_type as keyof typeof counts]++;
        }
      });
    });
    return counts;
  };

  const alertStats = getAlertsByType();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-bell me-3"></i>
          Nhật ký cảnh báo
        </h2>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mt-2 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Tổng cảnh báo</small>
                  <h4 className="mb-0 mt-1">{getTotalAlerts()}</h4>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-bell fa-2x text-secondary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Nhiệt độ cao</small>
                  <h4 className="mb-0 mt-1 text-danger">{alertStats.TEMP_HIGH}</h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="fas fa-temperature-arrow-up fa-2x text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Nhiệt độ thấp</small>
                  <h4 className="mb-0 mt-1 text-info">{alertStats.TEMP_LOW}</h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="fas fa-temperature-arrow-down fa-2x text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Độ ẩm bất thường</small>
                  <h4 className="mb-0 mt-1 text-primary">{alertStats.HUM_HIGH + alertStats.HUM_LOW}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-droplet fa-2x text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Logs */}
      <div className="mt-4">
        {alertLogs.length === 0 ? (
          <div className="data-card">
            <div className="data-card-body text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có cảnh báo nào</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {/* Thay thế toàn bộ phần render danh sách */}
            {alertLogs.map((log, index) => {
              const plan = log.work_plan;
              const rfid = log.rfid_tag;
              const isExpanded = expandedPlanId === `${plan.work_plan_id}-${rfid.rfid_tag_id}`;

              return (
                <div key={`${plan.work_plan_id}-${rfid.rfid_tag_id}`} className="col-12">
                  <div className="data-card position-relative">
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-dark">
                        STT: {index + 1 + (currentPage - 1) * limit}
                      </span>
                    </div>

                    {/* HEADER: KẾ HOẠCH + RFID */}
                    <div
                      className="d-block data-card-header"
                      style={{ cursor: 'pointer' }}
                      onClick={() => togglePlan(`${plan.work_plan_id}-${rfid.rfid_tag_id}`)}
                    >
                      <div className="d-flex justify-content-between align-items-center ms-4">
                        <div className="d-flex align-items-center gap-3">
                          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                          <div className="me-4">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <i className="fas fa-clipboard-list text-success"></i>
                              <h5 className="mb-0">{plan.description}</h5>
                              <span className={`badge ${getStatusBadgeClass(plan.status)} ms-2`}>
                                {getStatusText(plan.status)}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <i className="fas fa-id-card text-primary"></i>
                              <>{rfid.uid}</>
                              <span className="text-muted">- {rfid.location_name}</span>
                            </div>
                            <div className="d-flex gap-3 align-items-center mt-1">
                              <small className="text-muted">
                                <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                                {log.alerts.length} cảnh báo
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="text-end ms-auto">
                          <small className="text-muted d-block">Ngưỡng nhiệt độ: ±{plan.temp_threshold}°C</small>
                          <small className="text-muted d-block">Ngưỡng độ ẩm: ±{plan.hum_threshold}%</small>
                          <small className="text-muted d-block">Ngưỡng cho phép: Dưới {plan.violation_count} lần</small>
                        </div>
                      </div>
                    </div>

                    {/* NỘI DUNG CHI TIẾT */}
                    {isExpanded && (
                      <div className="p-4 bg-light">
                        <div className="table-responsive">
                          <table className="table table-sm table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Loại</th>
                                <th>Lần đo</th>
                                <th className="text-center">Đo được</th>
                                <th className="text-center">Chuẩn</th>
                                <th className="text-center">Ngưỡng</th>
                                <th className="text-center">Lệch</th>
                                <th>Thời gian</th>
                              </tr>
                            </thead>
                            <tbody>
                              {log.alerts.map((alert) => {
                                const typeInfo = getAlertTypeInfo(alert.alert_type);
                                const deviation = Math.abs(alert.measured_value - alert.reference_value);
                                const isTemp = alert.alert_type.includes('TEMP');

                                return (
                                  <tr key={alert.alert_id}>
                                    <td><small className="badge bg-secondary">{alert.alert_id}</small></td>
                                    <td>
                                      <div className="d-flex align-items-center gap-1">
                                        <i className={`fas ${typeInfo.icon} ${typeInfo.color} fa-xs`}></i>
                                        <small className={typeInfo.color}>{typeInfo.text}</small>
                                      </div>
                                    </td>
                                    <td><span className="badge bg-info">Lần {alert.measurement_number}</span></td>
                                    <td className="text-center">
                                      <strong className={typeInfo.color}>
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
                                      <span className={`badge ${typeInfo.bgColor} bg-opacity-75`}>
                                        {deviation.toFixed(1)}
                                      </span>
                                    </td>
                                    <td>
                                      <small className="text-muted">
                                        {formatDateTime(alert.timestamp)}
                                      </small>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-3 p-3 bg-light rounded small">
                          <strong>Tổng: {log.alerts.length} cảnh báo</strong> tại vị trí này
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phân trang */}
      <div className="d-flex justify-content-center mt-4 mb-3">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
          />
        </Stack>
      </div>
    </div>
  );
}