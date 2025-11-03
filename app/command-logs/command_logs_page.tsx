'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import Stack from '@mui/material/Stack';

interface CommandLog {
  id: number;                    // Ẩn, dùng làm key
  command: string;               // Lệnh đã gửi
  timestamp: string;          // Thời gian gửi lệnh (ISO string)
  created_at: string;          // Thời gian lưu lệnh (ISO string)
}

interface ApiResponse {
  data: CommandLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CommandLogsPage() {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch dữ liệu từ API
  const fetchCommandLogs = async (page: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(
        `${backendUrl}/commands?page=${page}&limit=15`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch command logs');
      }

      const apiData: ApiResponse = await response.json();

      // Chuyển đổi dữ liệu từ API để khớp với interface
      const convertedLogs: CommandLog[] = apiData.data.map(item => ({
        id: item.id,
        command: item.command,
        timestamp: item.timestamp,      // ✅ Đúng: API dùng timestamp
        created_at: item.created_at    // ✅ Đúng: API dùng created_at
      }));


      setLogs(convertedLogs);
      setTotalPages(apiData.totalPages);
      setCurrentPage(apiData.page);
    } catch (error) {
      console.error('Error fetching command logs:', error);
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchCommandLogs(1);
  }, []);

  // Xử lý chuyển trang
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchCommandLogs(value);
  };

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-terminal me-3"></i>
          Nhật ký lệnh
        </h2>
      </div>

      <div className="mt-4">
        <div className="data-card">
          <div className="table-responsive">
            <table style={{ tableLayout: 'fixed', width: '100%' }} className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '80px' }}>STT</th>
                  <th>Lệnh đã gửi</th>
                  <th className="text-center" style={{ width: '200px' }}>Thời gian gửi</th>
                  <th className="text-center" style={{ width: '200px' }}>Thời gian lưu</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id}>
                    {/* Số thứ tự: tự sinh từ index + 1 */}
                    <td className="text-center fw-semibold">
                      {(currentPage - 1) * 15 + index + 1}
                    </td>

                    {/* Lệnh: in đậm, màu xanh nếu là lệnh di chuyển */}
                    <td
                      className="font-monospace"
                      style={{
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        color: log.command.includes('MOVE') || log.command.includes('RETURN') ? '#0d6efd' : '#333'
                      }}
                    >
                      {log.command}
                    </td>

                    {/* Thời gian gửi lệnh */}
                    <td className="text-center text-muted small">
                      {formatDateTime(log.timestamp)}
                    </td>

                    {/* Thời gian lưu */}
                    <td className="text-center text-muted small">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}