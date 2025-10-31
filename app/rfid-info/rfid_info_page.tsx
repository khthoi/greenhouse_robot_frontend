'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

interface RFIDCard {
  id: number;
  uid: string;
  location_name: string;
  description: string;
  reference_temperature: number;
  reference_humidity: number;
  created_at: string;
  updated_at: string;
}

export default function RFIDInfoPage() {
  const [cards, setCards] = useState<RFIDCard[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const limit = 15;

  // Fetch RFID tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/rfid-tags?page=${currentPage}&limit=${limit}`);
        const json = await res.json();
        setCards(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch {
        setCards([]);
        setTotalPages(1);
      }
    };
    fetchData();
  }, [currentPage, apiUrl, refreshTrigger]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

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

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm thẻ RFID mới',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">UID</label>
            <input id="uid" class="form-control" placeholder="Nhập UID">
          </div>
          <div class="mb-3">
            <label class="form-label">Vị trí</label>
            <input id="location_name" class="form-control" placeholder="Vị trí thẻ RFID">
          </div>
          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea id="description" class="form-control" rows="2" placeholder="Nhập mô tả"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Nhiệt độ gốc (°C)</label>
            <input id="reference_temperature" type="number" step="0.1" class="form-control" placeholder="25.0">
          </div>
          <div class="mb-3">
            <label class="form-label">Độ ẩm gốc (%)</label>
            <input id="reference_humidity" type="number" step="0.1" class="form-control" placeholder="70.0">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3498db',
      cancelButtonColor: '#95a5a6',
      preConfirm: () => {
        const uid = (document.getElementById('uid') as HTMLInputElement).value.trim();
        const location_name = (document.getElementById('location_name') as HTMLInputElement).value.trim();
        const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
        const reference_temperature = parseFloat((document.getElementById('reference_temperature') as HTMLInputElement).value);
        const reference_humidity = parseFloat((document.getElementById('reference_humidity') as HTMLInputElement).value);

        if (!uid || !location_name || !description || isNaN(reference_temperature) || isNaN(reference_humidity)) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
          return false;
        }

        return { uid, location_name, description, reference_temperature, reference_humidity };
      }
    });

    if (formValues) {
      try {
        const res = await fetch(`${apiUrl}/rfid-tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });
        if (!res.ok) throw new Error();
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã thêm thẻ RFID mới',
          confirmButtonColor: '#3498db'
        });
        // Reload data
        triggerRefresh();
        setCurrentPage(currentPage);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Thêm thẻ RFID thất bại',
          confirmButtonColor: '#e74c3c'
        });
      }
    }
  };

  const handleEdit = async (card: RFIDCard) => {
    const { value: formValues } = await Swal.fire({
      title: 'Sửa thông tin thẻ RFID',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">UID</label>
            <input id="uid" class="form-control" value="${card.uid}">
          </div>
          <div class="mb-3">
            <label class="form-label">Vị trí</label>
            <input id="location_name" class="form-control" value="${card.location_name}">
          </div>
          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea id="description" class="form-control" rows="2">${card.description}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Nhiệt độ gốc (°C)</label>
            <input id="reference_temperature" type="number" step="0.1" class="form-control" value="${card.reference_temperature}">
          </div>
          <div class="mb-3">
            <label class="form-label">Độ ẩm gốc (%)</label>
            <input id="reference_humidity" type="number" step="0.1" class="form-control" value="${card.reference_humidity}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3498db',
      cancelButtonColor: '#95a5a6',
      preConfirm: () => {
        const uid = (document.getElementById('uid') as HTMLInputElement).value.trim();
        const location_name = (document.getElementById('location_name') as HTMLInputElement).value.trim();
        const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
        const reference_temperature = parseFloat((document.getElementById('reference_temperature') as HTMLInputElement).value);
        const reference_humidity = parseFloat((document.getElementById('reference_humidity') as HTMLInputElement).value);
        if (!uid || !location_name || !description || isNaN(reference_temperature) || isNaN(reference_humidity)) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
          return false;
        }

        // Only send changed fields
        const changed: Partial<RFIDCard> = {};
        if (uid !== card.uid) changed.uid = uid;
        if (location_name !== card.location_name) changed.location_name = location_name;
        if (description !== card.description) changed.description = description;
        if (reference_temperature !== card.reference_temperature) changed.reference_temperature = reference_temperature;
        if (reference_humidity !== card.reference_humidity) changed.reference_humidity = reference_humidity;
        return changed;
      }
    });

    if (formValues && Object.keys(formValues).length > 0) {
      try {
        const res = await fetch(`${apiUrl}/rfid-tags/${card.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });
        if (!res.ok) throw new Error();
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã cập nhật thông tin thẻ RFID',
          confirmButtonColor: '#3498db'
        });
        triggerRefresh();
        setCurrentPage(currentPage); // reload
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Sửa thẻ RFID thất bại',
          confirmButtonColor: '#e74c3c'
        });
      }
    }
  };

  const handleDelete = async (card: RFIDCard) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      html: `Bạn có chắc chắn muốn xóa thẻ RFID <strong>${card.uid}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/rfid-tags/${card.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        await Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Thẻ RFID đã được xóa thành công',
          confirmButtonColor: '#3498db'
        });
        triggerRefresh();
        setCurrentPage(currentPage); // reload
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Xóa thẻ RFID thất bại',
          confirmButtonColor: '#e74c3c'
        });
      }
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <i className="fas fa-id-card me-3"></i>
          Thông tin thẻ từ
        </h2>
      </div>

      <div className="mt-4">
        <div className="mb-3">
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className="fas fa-plus me-2"></i>
            Thêm thẻ RFID
          </button>
        </div>

        <div className="data-card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center">STT</th>
                  <th>UID</th>
                  <th>Vị trí</th>
                  <th>Mô tả</th>
                  <th className="text-center">Nhiệt độ gốc (°C)</th>
                  <th className="text-center">Độ ẩm gốc (%)</th>
                  <th>Thời gian tạo</th>
                  <th>Thời gian cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card, index) => (
                  <tr key={card.id}>
                    <td className="fw-semibold text-center">{index + 1 + (currentPage - 1) * limit}</td>
                    <td className="fw-semibold">{card.uid}</td>
                    <td>{card.location_name}</td>
                    <td>{card.description}</td>
                    <td className="text-center">{card.reference_temperature.toFixed(1)}</td>
                    <td className="text-center">{card.reference_humidity.toFixed(1)}</td>
                    <td className="text-muted small">{formatDateTime(card.created_at)}</td>
                    <td className="text-muted small">{formatDateTime(card.updated_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(card)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(card)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cards.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-muted py-4">
                      Không có dữ liệu thẻ RFID.
                    </td>
                  </tr>
                )}
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