'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

let socket: Socket | null = null;

export default function SocketNotifications() {
  useEffect(() => {
    // Kết nối socket
    socket = io('http://localhost:3003', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      toast.success('🔌 Kết nối thành công với server!', {
        position: 'top-right',
        autoClose: 3000,
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      toast.warning('⚠️ Mất kết nối với server', {
        position: 'top-right',
        autoClose: 3000,
      });
    });

    // Map trạng thái sang text tiếng Việt
    const statusTextMap: Record<string, string> = {
      NOT_RECEIVED: 'Chưa nhận',
      RECEIVED: 'Đã nhận',
      IN_PROGRESS: 'Đang thực hiện',
      COMPLETED: 'Đã hoàn thành',
      FAILED: 'Thất bại',
    };

    // Lắng nghe sự kiện work_plan_status
    socket.on('work_plan_status', (data) => {
      console.log('work_plan_status:', data);
      const plan = data.data;

      // Lấy text tiếng Việt
      const statusText = statusTextMap[plan.status] || plan.status;

      toast.info(
        <div>
          <strong>📋 Trạng thái kế hoạch</strong>
          <div className="mt-2">
            <div><strong>ID:</strong> {plan.id}</div>
            <div><strong>Mô tả:</strong> {plan.description}</div>
            <div>
              <strong>Trạng thái:</strong>{' '}
              <span className="badge bg-primary">{statusText}</span>
            </div>
            <div><strong>Tiến độ:</strong> {plan.progress}%</div>
          </div>
        </div>,
        { autoClose: 5000, position: 'top-right' }
      );
    });

    // Lắng nghe sự kiện work_plan_progress
    socket.on('work_plan_progress', (data) => {
      console.log('work_plan_progress:', data);
      const plan = data.data;
      toast.info(
        <div>
          <strong>📊 Cập nhật tiến độ</strong>
          <div className="mt-2">
            <div><strong>Kế hoạch:</strong> {plan.description}</div>
            <div><strong>Tiến độ:</strong> <span className="badge bg-success">{plan.progress}%</span></div>
            <div><strong>Vi phạm:</strong> {plan.violation_count}</div>
          </div>
        </div>,
        { autoClose: 4000, position: 'top-right' }
      );
    });

    // Lắng nghe sự kiện alert
    socket.on('alert', (data) => {
      console.log('alert:', data);
      const alertTypes: Record<string, string> = {
        'TEMP_HIGH': '🌡️ Nhiệt độ cao',
        'TEMP_LOW': '❄️ Nhiệt độ thấp',
        'HUM_HIGH': '💧 Độ ẩm cao',
        'HUM_LOW': '🏜️ Độ ẩm thấp',
      };

      toast.error(
        <div>
          <strong>{alertTypes[data.alert_type] || '⚠️ Cảnh báo'}</strong>
          <div className="mt-2">
            <div><strong>Vị trí:</strong> {data.location_name}</div>
            <div><strong>Giá trị đo:</strong> {data.measured_value}</div>
            <div><strong>Giá trị tham chiếu:</strong> {data.reference_value}</div>
            <div><strong>Ngưỡng:</strong> ±{data.threshold}</div>
            <div><strong>Lần đo:</strong> {data.measurement_number}</div>
            <div className="mt-1 text-danger"><em>{data.message}</em></div>
          </div>
        </div>,
        { autoClose: 7000, position: 'top-right' }
      );
    });

    // Lắng nghe sự kiện status
    socket.on('status', (data) => {
      console.log('status:', data);
      const statusIcons: Record<string, string> = {
        'NONE': '⚪',
        'WORKING': '🟢',
        'ERROR': '🔴',
        'PAUSED': '🟡',
      };

      toast.info(
        <div>
          <strong>{statusIcons[data.status] || '🤖'} Trạng thái Robot</strong>
          <div className="mt-2">
            <div><strong>Trạng thái:</strong> <span className="badge bg-info">{data.status}</span></div>
            <div><strong>Chế độ:</strong> {data.mode}</div>
            <div><strong>Lệnh:</strong> {data.command_excuted}</div>
            <div><strong>Thông báo:</strong> {data.message}</div>
          </div>
        </div>,
        { autoClose: 4000, position: 'top-right' }
      );
    });

    // Lắng nghe sự kiện command_sended
    socket.on('command_sended', (data) => {
      console.log('command_sended:', data);
      const commandNames: Record<string, string> = {
        'FORWARD': '⬆️ Tiến',
        'BACKWARD': '⬇️ Lùi',
        'TURN_LEFT': '⬅️ Rẽ trái',
        'TURN_RIGHT': '➡️ Rẽ phải',
        'STOP': '🛑 Dừng',
      };

      toast.success(
        <div>
          <strong>📡 Lệnh đã gửi</strong>
          <div className="mt-2">
            <div><strong>Lệnh:</strong> <span className="badge bg-success">{commandNames[data.command] || data.command}</span></div>
            <div><strong>Thời gian:</strong> {new Date(data.timestamp).toLocaleString('vi-VN')}</div>
          </div>
        </div>,
        { autoClose: 3000, position: 'top-right' }
      );
    });

    // Lắng nghe sự kiện obstacle
    socket.on('obstacle', (data) => {
      console.log('obstacle:', data);
      const suggestionNames: Record<string, string> = {
        'TURN_LEFT': '⬅️ Rẽ trái',
        'TURN_RIGHT': '➡️ Rẽ phải',
        'BACKWARD': '⬇️ Lùi lại',
        'STOP': '🛑 Dừng lại',
      };

      toast.warning(
        <div>
          <strong>⚠️ Phát hiện vật cản</strong>
          <div className="mt-2">
            <div><strong>Khoảng cách trung tâm:</strong> {data.center_distance}cm</div>
            <div><strong>Khoảng cách trái:</strong> {data.left_distance}cm</div>
            <div><strong>Khoảng cách phải:</strong> {data.right_distance}cm</div>
            <div className="mt-1"><strong>Đề xuất:</strong> <span className="badge bg-warning text-dark">{suggestionNames[data.suggestion] || data.suggestion}</span></div>
          </div>
        </div>,
        { autoClose: 5000, position: 'top-right' }
      );
    });

    socket.on('robot.connected', (data) => {
      console.log('robot.connected:', data);
      toast.success(
        <div>
          <strong>Kết nối thành công với Robot!</strong>
          <div className="mt-2">
            <div><strong>IP Robot:</strong> {data.esp32_ip}</div>
          </div>
        </div>,
        { autoClose: 5000, position: 'top-right' }
      );
    });

    // Cleanup khi unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return null; // Component này không render gì
}

export { socket };