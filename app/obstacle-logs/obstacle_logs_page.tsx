'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

interface ObstacleLog {
  id: number;
  centerPosition: number;
  leftPosition: number;
  rightPosition: number;
  suggestedCommand: string;
  executedCommand: string;
  detectedAt: string;
  created_at: string;
}

const SUGGESTION_MAP: Record<string, string> = {
  TURN_RIGHT: 'Rẽ phải',
  TURN_LEFT: 'Rẽ trái',
  EMERGENCY_STOP: 'Dừng khẩn cấp',
  REVERSE: 'Lùi xe',
  SLOW_DOWN: 'Giảm tốc độ',
  AVOID_RIGHT: 'Tránh vật cản bên phải',
  AVOID_LEFT: 'Tránh vật cản bên trái',
};

const ACTION_MAP: Record<string, string> = {
  TURN_RIGHT: 'Rẽ phải',
  TURN_LEFT: 'Rẽ trái',
  STOP: 'Dừng',
  REVERSE: 'Lùi',
  SLOW_DOWN: 'Giảm tốc',
};

export default function ObstacleLogsPage() {
  const [logs, setLogs] = useState<ObstacleLog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const res = await fetch(
          `${apiUrl}/obstacle-logs?page=${currentPage}&limit=15`
        );
        const json = await res.json();

        setLogs(
          (json.data || []).map((item: any) => ({
            id: item.id,
            centerPosition: item.center_distance,
            leftPosition: item.left_distance,
            rightPosition: item.right_distance,
            suggestedCommand: SUGGESTION_MAP[item.suggestion] || item.suggestion,
            executedCommand: ACTION_MAP[item.action_taken] || item.action_taken,
            created_at: item.created_at,
          }))
        );
        setTotalPages(json.totalPages || 1);
      } catch (error) {
        setLogs([]);
        setTotalPages(1);
      }
    };

    fetchData();
  }, [currentPage]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  const formatPosition = (value: number) => `${value.toFixed(2)} cm`;

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-exclamation-triangle me-3"></i>
          Nhật ký phát hiện vật cản
        </h2>
      </div>

      <div className="mt-4">
        <div className="data-card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Vị trí ở giữa</th>
                  <th className="text-center">Vị trí bên trái</th>
                  <th className="text-center">Vị trí bên phải</th>
                  <th>Lệnh đề xuất</th>
                  <th>Lệnh thực thi</th>
                  <th>Thời gian lưu</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id}>
                    <td className="text-center fw-semibold">{index + 1 + (currentPage - 1) * 15}</td>
                    <td className="text-center fw-semibold">
                      {formatPosition(log.centerPosition)}
                    </td>
                    <td className="text-center">
                      {formatPosition(log.leftPosition)}
                    </td>
                    <td className="text-center">
                      {formatPosition(log.rightPosition)}
                    </td>
                    <td>{log.suggestedCommand}</td>
                    <td>{log.executedCommand}</td>
                    <td className="text-muted small">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Không có dữ liệu nhật ký vật cản.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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