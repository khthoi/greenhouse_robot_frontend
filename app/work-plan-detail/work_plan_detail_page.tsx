'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

interface Measurement {
  measurement_number: number;
  temperature: number | null;
  humidity: number | null;
  created_at: string;
}

interface RFIDTag {
  rfid_tag_id: number;
  uid: string;
  location_name: string;
}

interface WorkPlanItem {
  rfid_tag: RFIDTag;
  measurements: Measurement[];
  measurement_frequency: number;
}

interface CollectedData {
  work_plan_id: number;
  description: string;
  status: string;
  progress: string;
  temp_threshold: number;
  hum_threshold: number;
  violation_count: number;
  items: WorkPlanItem[];
}

export default function CollectedDataPage() {
  const [collectedData, setCollectedData] = useState<CollectedData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [expandedLocationId, setExpandedLocationId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const limit = 15;

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/work-plans/measurements?page=${currentPage}&limit=${limit}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setCollectedData(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error('Lỗi fetch measurements:', err);
        setCollectedData([]);
        setTotalPages(1);
      }
    };
    fetchData();
  }, [currentPage, apiUrl]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'RECEIVED': return 'bg-info';
      case 'NOT_RECEIVED': return 'bg-warning';
      case 'FAILED': return 'bg-danger';
      case 'SUSPENDED': return 'bg-secondary';
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
      case 'SUSPENDED': return 'Đã tạm dừng';
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

  const toggleExpandPlan = (planId: number) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      setExpandedLocationId(null);
    } else {
      setExpandedPlanId(planId);
      setExpandedLocationId(null);
    }
  };

  const toggleExpandLocation = (locationId: number) => {
    setExpandedLocationId(prev => (prev === locationId ? null : locationId));
  };

  const getTotalMeasurements = (plan: CollectedData) => {
    return plan.items.reduce((total, item) => total + item.measurement_frequency, 0);
  };

  const getCompletedMeasurements = (plan: CollectedData) => {
    return plan.items.reduce((total, item) =>
      total + item.measurements.filter(m => m.temperature !== null && m.humidity !== null).length,
      0);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-database me-3"></i>
          Dữ liệu thu thập từ kế hoạch
        </h2>
      </div>

      <div className="mt-4">
        {collectedData.length === 0 ? (
          <div className="data-card">
            <div className="data-card-body text-center py-5">
              <p className="text-muted">Chưa có dữ liệu thu thập</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {collectedData.map((plan, index) => (
              <div key={plan.work_plan_id} className="col-12">
                <div className="data-card position-relative">
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-dark">
                      STT: {index + 1 + (currentPage - 1) * limit}
                    </span>
                  </div>

                  {/* Plan Header */}
                  <div
                    className="data-card-header d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleExpandPlan(plan.work_plan_id)}
                  >
                    <div className="d-flex align-items-center gap-3 ms-4">
                      <i className={`fas fa-chevron-${expandedPlanId === plan.work_plan_id ? 'down' : 'right'}`}></i>
                      <div>
                        <h5 className="mb-1">{plan.description}</h5>
                        <div className="d-flex gap-3 align-items-center">
                          <span className={`badge ${getStatusBadgeClass(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                          <small className="text-muted">
                            <i className="fas fa-chart-line me-1"></i>
                            Tiến độ: {parseFloat(plan.progress).toFixed(2)}%
                          </small>
                          <small className="text-muted">
                            <i className="fas fa-clipboard-check me-1"></i>
                            Đã đo: {getCompletedMeasurements(plan)}/{getTotalMeasurements(plan)} lần
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block">Ngưỡng nhiệt độ: ±{plan.temp_threshold}°C</small>
                      <small className="text-muted d-block">Ngưỡng độ ẩm: ±{plan.hum_threshold}%</small>
                      <small className="text-muted d-block">Vi phạm tối đa: {plan.violation_count} lần</small>
                    </div>
                  </div>

                  {/* Plan Content */}
                  {expandedPlanId === plan.work_plan_id && (
                    <div className="p-4 bg-light">
                      <h6 className="mb-3">
                        <i className="fas fa-map-marked-alt me-2"></i>
                        Dữ liệu theo vị trí ({plan.items.length} vị trí)
                      </h6>

                      {plan.items.map((item) => (
                        <div key={item.rfid_tag.rfid_tag_id} className="mb-3">
                          <div className="card" style={{ cursor: 'pointer' }}>
                            <div
                              className="card-header bg-white d-flex justify-content-between align-items-center"
                              onClick={() => toggleExpandLocation(item.rfid_tag.rfid_tag_id)}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <i className={`fas fa-chevron-${expandedLocationId === item.rfid_tag.rfid_tag_id ? 'down' : 'right'}`}></i>
                                <i className="fas fa-id-card text-primary me-2"></i>
                                <strong>{item.rfid_tag.uid}</strong>
                                <span className="text-muted">- {item.rfid_tag.location_name}</span>
                              </div>
                              <div>
                                <span className="badge bg-info">
                                  {item.measurements.length}/{item.measurement_frequency} lần đo
                                </span>
                              </div>
                            </div>

                            {expandedLocationId === item.rfid_tag.rfid_tag_id && (
                              <div className="card-body">
                                <div className="table-responsive">
                                  <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                      <tr>
                                        <th className="text-center" style={{ width: '80px' }}>Lần đo</th>
                                        <th className="text-center">Nhiệt độ</th>
                                        <th className="text-center">Độ ẩm</th>
                                        <th className='text-center'>Thời gian lưu</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.measurements.length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="text-center text-muted py-3">
                                            Chưa có dữ liệu đo
                                          </td>
                                        </tr>
                                      ) : (
                                        item.measurements.map((measurement, measIndex) => (
                                          <tr key={measIndex}>
                                            <td className="text-center">
                                              <span className="badge bg-secondary">
                                                #{measurement.measurement_number}
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              {measurement.temperature !== null ? (
                                                <span className="fw-semibold text-danger">
                                                  {measurement.temperature}°C
                                                </span>
                                              ) : (
                                                <span className="text-muted">--</span>
                                              )}
                                            </td>
                                            <td className="text-center">
                                              {measurement.humidity !== null ? (
                                                <span className="fw-semibold text-primary">
                                                  {measurement.humidity}%
                                                </span>
                                              ) : (
                                                <span className="text-muted">--</span>
                                              )}
                                            </td>
                                            <td className='text-center'>
                                              <small className="text-muted">
                                                <i className="far fa-save me-1"></i>
                                                {formatDateTime(measurement.created_at)}
                                              </small>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Statistics Summary */}
                                {item.measurements.length > 0 && (
                                  <div className="mt-3 p-3 bg-light rounded">
                                    <h6 className="mb-3">
                                      <i className="fas fa-chart-bar me-2"></i>
                                      Thống kê
                                    </h6>
                                    <div className="row g-3">
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted d-block">Nhiệt độ TB</small>
                                          <strong className="text-danger">
                                            {(
                                              item.measurements
                                                .filter(m => m.temperature !== null)
                                                .reduce((sum, m) => sum + (m.temperature || 0), 0) /
                                              (item.measurements.filter(m => m.temperature !== null).length || 1)
                                            ).toFixed(1)}°C
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted d-block">Độ ẩm TB</small>
                                          <strong className="text-primary">
                                            {(
                                              item.measurements
                                                .filter(m => m.humidity !== null)
                                                .reduce((sum, m) => sum + (m.humidity || 0), 0) /
                                              (item.measurements.filter(m => m.humidity !== null).length || 1)
                                            ).toFixed(1)}%
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted d-block">Nhiệt độ cao nhất</small>
                                          <strong className="text-danger">
                                            {Math.max(...item.measurements
                                              .filter(m => m.temperature !== null)
                                              .map(m => m.temperature || 0)
                                            )}°C
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted d-block">Độ ẩm cao nhất</small>
                                          <strong className="text-primary">
                                            {Math.max(...item.measurements
                                              .filter(m => m.humidity !== null)
                                              .map(m => m.humidity || 0)
                                            )}%
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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