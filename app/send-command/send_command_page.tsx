'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertColor } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';


export enum CommandType {
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  FOLLOW_LINE_MODE = 'FOLLOW_LINE_MODE',
  TURN_LEFT_FOR_OBSTACLE_AVOID = 'TURN_LEFT_FOR_OBSTACLE_AVOID',
  TURN_RIGHT_FOR_OBSTACLE_AVOID = 'TURN_RIGHT_FOR_OBSTACLE_AVOID',
  STOP = 'STOP',
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export default function SendCommandPage() {
  const [isPressed, setIsPressed] = useState<Record<string, boolean>>({
    FORWARD: false,
    BACKWARD: false,
    TURN_LEFT: false,
    TURN_RIGHT: false,
  });

  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('MANUAL');
  const [alert, setAlert] = useState<{ type: AlertColor; message: string } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  // Kết nối Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:3003', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO kết nối thành công');
    });

    newSocket.on('manual_command_response', (payload) => {
      const { type, responses } = payload;
      const { command, status, message, timestamp } = responses;

      const time = new Date(timestamp).toLocaleTimeString('vi-VN');

      toast(
        <div className="p-2">
          <strong className="d-block">{type === 'MANUAL_MOVE' ? 'Di chuyển' : 'Lệnh'}</strong>
          <small className="text-muted d-block">{command}</small>
          <div className={`badge ${status === 'SUCCESS' ? 'bg-success' : 'bg-danger'} mt-1`}>
            {status}
          </div>
          <div className="mt-1 small">{message}</div>
          <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
            {time}
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        }
      );
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO lỗi:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Gửi lệnh
  const sendCommand = useCallback(
    async (cmd: CommandType) => {
      try {
        const res = await fetch(`${apiUrl}/commands/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd }),
        });

        if (!res.ok) throw new Error();

        setAlert({ type: 'success', message: `Đã gửi: ${cmd}` });
        setTimeout(() => setAlert(null), 2000);
      } catch (err) {
        setAlert({ type: 'error', message: `Lỗi gửi lệnh: ${cmd}` });
        setTimeout(() => setAlert(null), 3000);
      }
    },
    [apiUrl]
  );

  const handleConnectRobot = () => {
    Swal.fire({
      title: 'Kết nối đến Robot',
      html: `
        <div class="text-start">
          <label for="robot-ip" class="form-label">Địa chỉ IP của server</label>
          <input type="text" id="robot-ip" class="form-control" placeholder="192.168.1.100" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Kết nối',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const ip = (Swal.getPopup()?.querySelector('#robot-ip') as HTMLInputElement)?.value;
        if (!ip) {
          Swal.showValidationMessage('Vui lòng nhập địa chỉ IP');
          return false;
        }
        return ip;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Đã kết nối tới robot tại ${result.value}`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Xử lý nhấn giữ
  const handleKeyDown = useCallback(
    (cmd: CommandType) => {
      if (!isPressed[cmd]) {
        setIsPressed((prev) => ({ ...prev, [cmd]: true }));
        sendCommand(cmd);
      }
    },
    [isPressed, sendCommand]
  );

  const handleKeyUp = useCallback(
    (cmd: CommandType) => {
      if (isPressed[cmd]) {
        setIsPressed((prev) => ({ ...prev, [cmd]: false }));
        sendCommand(CommandType.STOP);
      }
    },
    [isPressed, sendCommand]
  );

  const handleMode = (newMode: 'AUTO' | 'MANUAL') => {
    if (mode !== newMode) {
      setMode(newMode);
      sendCommand(newMode === 'AUTO' ? CommandType.AUTO : CommandType.MANUAL);
    }
  };

  // Bàn phím toàn cục
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      const map: Record<string, CommandType> = {
        W: CommandType.FORWARD,
        S: CommandType.BACKWARD,
        A: CommandType.TURN_LEFT,
        D: CommandType.TURN_RIGHT,
        ' ': CommandType.STOP,
        Q: CommandType.AUTO,
        E: CommandType.MANUAL,
      };

      if (map[key]) {
        e.preventDefault();
        if (['W', 'S', 'A', 'D'].includes(key)) {
          handleKeyDown(map[key]);
        } else {
          sendCommand(map[key]);
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const map: Record<string, CommandType> = {
        W: CommandType.FORWARD,
        S: CommandType.BACKWARD,
        A: CommandType.TURN_LEFT,
        D: CommandType.TURN_RIGHT,
      };

      if (map[key]) {
        e.preventDefault();
        handleKeyUp(map[key]);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, sendCommand]);

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="mb-0 d-flex align-items-center gap-3">
            <span>
              <i className="fas fa-gamepad me-3"></i>
              Điều khiển Robot
            </span>
            <button className="btn btn-outline-success btn-sm" onClick={handleConnectRobot}>
              <i className="fas fa-wifi me-1"></i>
              Kết nối
            </button>
          </h2>
        </div>

        {/* MUI Alert */}
        {alert && (
          <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
            <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ minWidth: 300 }}>
              {alert.message}
            </Alert>
          </div>
        )}

        <div className="mt-4">
          <div className="data-card">
            <div className="p-4">
              <h5 className="mb-4 text-center">
                <i className="fas fa-directions me-2"></i>
                Điều khiển di chuyển
              </h5>

              {/* Nút di chuyển */}
              <div className="d-flex justify-content-center mb-5">
                <div className="text-center">
                  {/* Tiến */}
                  <button
                    className={`btn btn-lg btn-outline-primary mb-3 ${isPressed[CommandType.FORWARD] ? 'active' : ''}`}
                    style={{ width: '80px', height: '80px' }}
                    onMouseDown={() => handleKeyDown(CommandType.FORWARD)}
                    onMouseUp={() => handleKeyUp(CommandType.FORWARD)}
                    onTouchStart={() => handleKeyDown(CommandType.FORWARD)}
                    onTouchEnd={() => handleKeyUp(CommandType.FORWARD)}
                  >
                    <div className="fs-4">W</div>
                    <small className="d-block">Tiến</small>
                  </button>

                  <div className="d-flex justify-content-center gap-3">
                    {/* Trái */}
                    <button
                      className={`btn btn-lg btn-outline-primary ${isPressed[CommandType.TURN_LEFT] ? 'active' : ''}`}
                      style={{ width: '80px', height: '80px' }}
                      onMouseDown={() => handleKeyDown(CommandType.TURN_LEFT)}
                      onMouseUp={() => handleKeyUp(CommandType.TURN_LEFT)}
                      onTouchStart={() => handleKeyDown(CommandType.TURN_LEFT)}
                      onTouchEnd={() => handleKeyUp(CommandType.TURN_LEFT)}
                    >
                      <div className="fs-4">A</div>
                      <small className="d-block">Trái</small>
                    </button>

                    {/* DỪNG */}
                    <button
                      className="btn btn-lg btn-danger"
                      style={{ width: '80px', height: '80px' }}
                      onClick={() => sendCommand(CommandType.STOP)}
                    >
                      <div className="fs-4"></div>
                      <small className="d-block">DỪNG</small>
                    </button>

                    {/* Phải */}
                    <button
                      className={`btn btn-lg btn-outline-primary ${isPressed[CommandType.TURN_RIGHT] ? 'active' : ''}`}
                      style={{ width: '80px', height: '80px' }}
                      onMouseDown={() => handleKeyDown(CommandType.TURN_RIGHT)}
                      onMouseUp={() => handleKeyUp(CommandType.TURN_RIGHT)}
                      onTouchStart={() => handleKeyDown(CommandType.TURN_RIGHT)}
                      onTouchEnd={() => handleKeyUp(CommandType.TURN_RIGHT)}
                    >
                      <div className="fs-4">D</div>
                      <small className="d-block">Phải</small>
                    </button>
                  </div>

                  {/* Lùi */}
                  <button
                    className={`btn btn-lg btn-outline-primary mt-3 ${isPressed[CommandType.BACKWARD] ? 'active' : ''}`}
                    style={{ width: '80px', height: '80px' }}
                    onMouseDown={() => handleKeyDown(CommandType.BACKWARD)}
                    onMouseUp={() => handleKeyUp(CommandType.BACKWARD)}
                    onTouchStart={() => handleKeyDown(CommandType.BACKWARD)}
                    onTouchEnd={() => handleKeyUp(CommandType.BACKWARD)}
                  >
                    <div className="fs-4">S</div>
                    <small className="d-block">Lùi</small>
                  </button>
                </div>
              </div>

              <hr className="my-5" />

              {/* Chế độ */}
              <h5 className="mb-4 text-center">
                <i className="fas fa-cogs me-2"></i>
                Chế độ hoạt động
              </h5>
              <div className="d-flex justify-content-center gap-4">
                <button
                  className={`btn btn-lg ${mode === 'AUTO' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleMode('AUTO')}
                >
                  <i className="fas fa-robot me-1"></i>
                  AUTO (Q)
                </button>
                <button
                  className={`btn btn-lg ${mode === 'MANUAL' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => handleMode('MANUAL')}
                >
                  <i className="fas fa-hand-paper me-1"></i>
                  MANUAL (E)
                </button>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-light p-3 mt-4 rounded">
              <small className="text-muted">
                <strong>Phím tắt:</strong>{' '}
                W=Tiến, S=Lùi, A=Trái, D=Phải, Space=Dừng, Q=AUTO, E=MANUAL
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}