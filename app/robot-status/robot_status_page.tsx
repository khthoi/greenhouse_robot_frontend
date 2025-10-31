'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

interface RobotStatus {
  id: number;
  status: string;
  message: string;
  mode: string;
  executedAt: string;
  created_at: string;
}

const STATUS_MAP: Record<string, string> = {
  RUNNING: 'Đang chạy',
  IDLE: 'Nghỉ',
};

export default function RobotStatusPage() {
  const [statuses, setStatuses] = useState<RobotStatus[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const res = await fetch(
          `${apiUrl}/robot-status?page=${currentPage}&limit=15`
        );
        const json = await res.json();

        // sample structure: { data: [...], totalPages: 1 }
        setStatuses(
          (json.data || []).map((item: any) => ({
            id: item.id,
            status:
              STATUS_MAP[item.status] ||
              item.status, // map status code to Vietnamese
            message: item.message,
            mode:
              STATUS_MAP[item.mode] ||
              item.mode, // map mode code to Vietnamese
            executedAt: item.timestamp,
            created_at: item.created_at,
          }))
        );
        setTotalPages(json.totalPages || 1);
      } catch (error) {
        setStatuses([]);
        setTotalPages(1);
      }
    };

    fetchData();
  }, [currentPage]);

  // Định dạng thời gian ISO → HH:mm:ss DD/MM/YYYY
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-robot me-3"></i>
          Trạng thái Robot
        </h2>
      </div>

      <div className="mt-4">
        <div className="data-card">
          <div className="table-responsive">
            <table style={{ tableLayout: 'fixed', width: '100%' }} className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center">STT</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center" style={{ width: "470px" }}>Tin nhắn</th>
                  <th className="text-center">Chế độ</th>
                  <th className="text-center">Thời gian thực thi</th>
                  <th className="text-center">Thời gian lưu</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center fw-semibold">{index + 1 + (currentPage - 1) * 15}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          item.status === 'Đang chạy'
                            ? 'bg-warning'
                            : item.status === 'Nghỉ'
                            ? 'bg-success'
                            : item.status === 'Lỗi'
                            ? 'bg-danger'
                            : item.status === 'Hoàn thành'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td
                      style={{
                        width: '470px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={item.message}
                    >
                      {item.message}
                    </td>
                    <td className="text-center">{item.mode}</td>
                    <td className="text-muted small text-center">
                      {formatDateTime(item.executedAt)}
                    </td>
                    <td className="text-muted small text-center">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))}
                {statuses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Không có dữ liệu trạng thái robot.
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