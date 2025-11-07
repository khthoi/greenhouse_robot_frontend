// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { socket } from './SocketNotification';

interface CommandData {
  id?: number;
  command: string;
  timestamp: string;
  created_at?: string;
}

interface WorkPlanData {
  id: number;
  description: string;
  status: string;
  progress: string;
  temp_threshold: number;
  hum_threshold: number;
  violation_count_limit: number; // Số lần cho phép vi phạm
  created_at: string;
  items: Array<{
    rfid_tag_id: number;
    uid: string;
    location_name: string;
    measurement_frequency: number;
    current_measurements: number;
    latest_temperature?: number;
    latest_humidity?: number;
    latest_created_at?: string;
    violation_count: number; // Số lần cảnh báo của từng thẻ
  }>;
}

interface ObstacleData {
  id: number;
  center_distance: number;
  left_distance: number;
  right_distance: number;
  suggestion: string;
  action_taken: string;
  created_at: string;
}

interface StatusData {
  id: number;
  status: string;
  mode: string;
  message: string;
  created_at: string;
}

export default function Dashboard() {
  const [lastCommand, setLastCommand] = useState<CommandData | null>(null);
  const [workPlan, setWorkPlan] = useState<WorkPlanData | null>(null);
  const [obstacle, setObstacle] = useState<ObstacleData | null>(null);
  const [robotStatus, setRobotStatus] = useState<StatusData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 🟢 Fetch API /commands/latest
  useEffect(() => {
    const fetchLatestCommand = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/commands/latest`);
        if (!res.ok) return;
        const data = await res.json();
        setLastCommand({
          id: data.id,
          command: data.command,
          timestamp: data.timestamp,
        });
      } catch (err) {
        console.error('Không thể tải lệnh gần đây:', err);
      }
    };

    fetchLatestCommand();
    const interval = setInterval(fetchLatestCommand, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Fetch API /work-plan/details/latest
  useEffect(() => {
    const fetchLatestWorkPlan = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/work-plans/details/latest`);
        if (!res.ok) return;
        const data = await res.json();
        setWorkPlan(data);
      } catch (err) {
        console.error('Không thể tải kế hoạch công việc:', err);
      }
    };

    fetchLatestWorkPlan();
    const interval = setInterval(fetchLatestWorkPlan, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Fetch API /obstacles-log/latest
  useEffect(() => {
    const fetchLatestObstacle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/obstacle-logs/latest`);
        if (!res.ok) return;
        const data = await res.json();
        setObstacle(data);
      } catch (err) {
        console.error('Không thể tải thông tin vật cản:', err);
      }
    };

    fetchLatestObstacle();
    const interval = setInterval(fetchLatestObstacle, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Fetch API /robot-status/latest
  useEffect(() => {
    const fetchLatestRobotStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/robot-status/latest`);
        if (!res.ok) return;
        const data = await res.json();
        setRobotStatus(data);
      } catch (err) {
        console.error('Không thể tải trạng thái robot:', err);
      }
    };

    fetchLatestRobotStatus();
    const interval = setInterval(fetchLatestRobotStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Socket events (realtime updates)
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('command_sended', (data: CommandData) => setLastCommand(data));
    socket.on('work_plan_status', (data: { data: WorkPlanData }) => setWorkPlan(data.data));
    socket.on('work_plan_progress', (data: { data: WorkPlanData }) => setWorkPlan(data.data));
    socket.on('obstacle', (data: ObstacleData) => setObstacle(data));
    socket.on('status', (data: StatusData) => setRobotStatus(data));

    return () => {
      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('command_sended');
      socket?.off('work_plan_status');
      socket?.off('work_plan_progress');
      socket?.off('obstacle');
      socket?.off('status');
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'NONE': 'secondary',
      'RUNNING': 'success',
      'ERROR': 'danger',
      'IDLE': 'warning',
      'RECEIVED': 'info',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success',
    };
    return badges[status] || 'secondary';
  };

  const getSuggestionText = (suggestion: string) => {
    const texts: Record<string, string> = {
      'TURN_LEFT_FOR_OBSTACLE_AVOID': 'Rẽ trái để tránh vật cản',
      'TURN_RIGHT_FOR_OBSTACLE_AVOID': 'Rẽ phải để tránh vật cản',
      'STOP': 'Dừng lại',
      'CONTINUE': 'Tiếp tục',
    };
    return texts[suggestion] || suggestion;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-chart-line me-3"></i>
          Dữ liệu trực tuyến từ server
        </h2>
        <div className="mt-2">
          <span className={`badge bg-${isConnected ? 'success' : 'danger'}`}>
            {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
          </span>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Lệnh gần đây nhất */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-terminal me-2"></i>
              Lệnh gần đây nhất
            </div>
            <div className="card-body">
              {lastCommand ? (
                <div>
                  <h4 className="mb-3">
                    <span className="badge bg-primary fs-6">
                      {lastCommand.command}
                    </span>
                  </h4>
                  <p className="text-muted mb-1">
                    <i className="fas fa-clock me-2"></i>
                    <strong>Thời gian:</strong>{' '}
                    {new Date(lastCommand.timestamp).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="fas fa-code me-2"></i>
                    <strong>Mã lệnh:</strong> {lastCommand.command}
                  </p>
                </div>
              ) : (
                <p className="text-muted mb-0">Chưa có dữ liệu lệnh</p>
              )}
            </div>
          </div>
        </div>

        {/* Tiến trình công việc gần đây nhất */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <i className="fa-solid fa-chart-simple me-2"></i>
              Tiến trình công việc gần đây nhất
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {workPlan ? (
                <div>
                  <h6 className="mb-3">{workPlan.description}</h6>
                  <p className="text-muted mb-1">
                    <i className="fas fa-clock me-2"></i>
                    <strong>Thời gian tạo kế hoạch:</strong>{' '}
                    {new Date(workPlan.created_at).toLocaleString('vi-VN')}
                  </p>
                  <div className="mb-3">
                    <span className={`badge bg-${getStatusBadge(workPlan.status)} me-2`}>
                      {workPlan.status}
                    </span>
                    <span className="badge bg-warning text-dark">
                      Cho phép vi phạm: {workPlan.violation_count_limit} lần
                    </span>
                  </div>

                  {/* Ngưỡng nhiệt độ và độ ẩm */}
                  <div className="mb-3 p-2 bg-light rounded">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Ngưỡng chênh nhiệt độ</small>
                        <strong className="text-danger">±{workPlan.temp_threshold}°C</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Ngưỡng chênh độ ẩm</small>
                        <strong className="text-primary">±{workPlan.hum_threshold}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tiến độ kế hoạch */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="mb-0 fw-bold text-secondary text-uppercase">
                        <i className="fas fa-tasks me-2 text-primary"></i>
                        Tiến độ
                      </h6>
                      <span className="badge bg-primary fs-6">
                        {workPlan.progress}%
                      </span>
                    </div>

                    <div className="progress" style={{ height: '26px', borderRadius: '12px' }}>
                      <div
                        className="progress-bar bg-success fw-semibold d-flex align-items-center justify-content-center"
                        role="progressbar"
                        style={{
                          width: `${workPlan.progress}%`,
                          fontSize: '0.85rem',
                          borderRadius: '12px'
                        }}
                        aria-valuenow={parseFloat(workPlan.progress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {workPlan.progress}%
                      </div>
                    </div>
                  </div>

                  {/* Danh sách RFID Tags */}
                  <div className="mt-3">
                    <h6 className="text-primary mb-2">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Danh sách điểm đo ({workPlan.items.length})
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>UID</th>
                            <th>Vị trí</th>
                            <th className="text-center">Đo</th>
                            <th className="text-center">Nhiệt độ</th>
                            <th className="text-center">Độ ẩm</th>
                            <th className="text-center">Cảnh báo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workPlan.items.map((item) => {
                            const isMeasured = item.current_measurements > 0;
                            const progress = item.measurement_frequency > 0
                              ? Math.round((item.current_measurements / item.measurement_frequency) * 100)
                              : 0;

                            return (
                              <tr key={item.rfid_tag_id} className={!isMeasured ? 'text-muted' : ''}>
                                <td>
                                  <code className="small">{item.uid}</code>
                                </td>
                                <td>
                                  <span className="fw-medium">{item.location_name}</span>
                                </td>
                                <td className="text-center">
                                  <div>
                                    <small>
                                      {item.current_measurements}/{item.measurement_frequency}
                                    </small>
                                    {item.measurement_frequency > 0 && (
                                      <div className="progress mt-1" style={{ height: '4px' }}>
                                        <div
                                          className={`progress-bar ${progress >= 100 ? 'bg-success' : 'bg-warning'}`}
                                          style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="text-center">
                                  {item.latest_temperature !== undefined ? (
                                    <span className={item.latest_temperature > workPlan.temp_threshold ? 'text-danger fw-bold' : 'text-success'}>
                                      {item.latest_temperature}°C
                                    </span>
                                  ) : (
                                    <span className="text-muted">--</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  {item.latest_humidity !== undefined ? (
                                    <span className={item.latest_humidity > workPlan.hum_threshold ? 'text-danger fw-bold' : 'text-success'}>
                                      {item.latest_humidity}%
                                    </span>
                                  ) : (
                                    <span className="text-muted">--</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <span className={`badge ${item.violation_count > 0 ? 'bg-danger' : 'bg-success'}`}>
                                    {item.violation_count}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-3 text-end">
                    <small className="text-muted">
                      Cập nhật lần cuối từ server: {new Date().toLocaleTimeString('vi-VN')}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-clipboard-list fa-3x mb-3 opacity-25"></i>
                  <p>Chưa có kế hoạch công việc</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thông báo vật cản gần đây nhất */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-dark">
              <i className="fas fa-triangle-exclamation me-2"></i>
              Thông báo vật cản gần đây nhất
            </div>
            <div className="card-body">
              {obstacle ? (
                <div>
                  <div className="alert alert-warning mb-3" role="alert">
                    <strong>⚠️ Phát hiện vật cản!</strong>
                  </div>

                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <div className="obstacle-value">{obstacle.left_distance}cm</div>
                      <small className="text-muted">⬅️ Trái</small>
                    </div>
                    <div className="col-4">
                      <div className="obstacle-value text-danger">{obstacle.center_distance}cm</div>
                      <small className="text-muted">⬆️ Giữa</small>
                    </div>
                    <div className="col-4">
                      <div className="obstacle-value">{obstacle.right_distance}cm</div>
                      <small className="text-muted">➡️ Phải</small>
                    </div>
                  </div>

                  <div className="mb-2">
                    <strong>Đề xuất:</strong>
                    <div className="mt-1">
                      <span className="badge bg-warning text-dark fs-6">
                        {getSuggestionText(obstacle.suggestion)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <strong>Hành động:</strong>
                    <span className={`badge ms-2 bg-primary fs-6`}>
                      {obstacle.action_taken}
                    </span>
                  </div>

                  <p className="text-muted mb-0">
                    <i className="fas fa-clock me-2"></i>
                    {new Date(obstacle.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-check-circle fa-3x mb-3 text-success opacity-25"></i>
                  <p className="mb-0">Không phát hiện vật cản</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trạng thái robot */}
        <div className="col-lg-6 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <i className="fas fa-robot me-2"></i>
              Trạng thái robot gần đây nhất
            </div>
            <div className="card-body">
              {robotStatus ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-5">
                      <small className="text-muted d-block">Trạng thái</small>
                      <span
                        className={`badge fs-6 ${robotStatus.status === 'RUNNING'
                            ? 'bg-warning text-dark'
                            : robotStatus.status === 'IDLE'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                      >
                        {robotStatus.status}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Chế độ</small>
                      <span
                        className={`badge fs-6 ${robotStatus.mode === 'AUTO' ? 'bg-success' : 'bg-warning text-dark'
                          }`}
                      >
                        {robotStatus.mode}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <strong className="d-block mb-2">
                      <i className="fas fa-info-circle me-2 text-info"></i>
                      Thông báo:
                    </strong>
                    <p className="mb-0">{robotStatus.message}</p>
                  </div>

                  <p className="text-muted mb-0">
                    <i className="fas fa-clock me-2"></i>
                    <small>{new Date(robotStatus.created_at).toLocaleString('vi-VN')}</small>
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <div className="spinner-border text-secondary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mb-0">Đang chờ kết nối với robot...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .data-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .obstacle-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
}