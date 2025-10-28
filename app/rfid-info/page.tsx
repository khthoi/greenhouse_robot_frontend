'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

interface RFIDCard {
  id: number;
  uid: string;
  location: string;
  description: string;
  baseTemperature: number;
  baseHumidity: number;
  createdAt: string;
  updatedAt: string;
}

export default function RFIDInfoPage() {
  const [cards, setCards] = useState<RFIDCard[]>([
    {
      id: 1,
      uid: 'A1B2C3D4',
      location: 'Thẻ RFID tại khu vực A',
      description: 'Khu vực trồng rau xanh',
      baseTemperature: 25.5,
      baseHumidity: 65.0,
      createdAt: '2024-01-15 08:30:00',
      updatedAt: '2024-10-20 14:25:30'
    },
    {
      id: 2,
      uid: 'E5F6G7H8',
      location: 'Thẻ RFID tại khu vực B',
      description: 'Khu vực trồng hoa',
      baseTemperature: 22.0,
      baseHumidity: 70.5,
      createdAt: '2024-02-10 09:15:00',
      updatedAt: '2024-10-21 10:10:15'
    },
    {
      id: 3,
      uid: 'I9J0K1L2',
      location: 'Thẻ RFID tại khu vực C',
      description: 'Khu vực ươm hạt giống',
      baseTemperature: 28.0,
      baseHumidity: 75.0,
      createdAt: '2024-03-05 10:00:00',
      updatedAt: '2024-10-22 16:45:20'
    },
    {
      id: 4,
      uid: 'M3N4O5P6',
      location: 'Thẻ RFID tại khu vực D',
      description: 'Khu vực cây ăn quả',
      baseTemperature: 26.5,
      baseHumidity: 68.0,
      createdAt: '2024-04-12 11:20:00',
      updatedAt: '2024-10-23 09:30:45'
    },
    {
      id: 5,
      uid: 'Q7R8S9T0',
      location: 'Thẻ RFID tại khu vực E',
      description: 'Khu vực thủy canh',
      baseTemperature: 24.0,
      baseHumidity: 80.0,
      createdAt: '2024-05-18 13:45:00',
      updatedAt: '2024-10-24 11:15:10'
    },
    {
      id: 6,
      uid: 'U1V2W3X4',
      location: 'Thẻ RFID tại khu vực F',
      description: 'Khu vực nấm',
      baseTemperature: 20.0,
      baseHumidity: 85.0,
      createdAt: '2024-06-22 14:30:00',
      updatedAt: '2024-10-25 15:20:35'
    },
    {
      id: 7,
      uid: 'Y5Z6A7B8',
      location: 'Thẻ RFID tại khu vực G',
      description: 'Khu vực rau gia vị',
      baseTemperature: 23.5,
      baseHumidity: 72.0,
      createdAt: '2024-07-08 15:10:00',
      updatedAt: '2024-10-26 08:40:25'
    },
    {
      id: 8,
      uid: 'C9D0E1F2',
      location: 'Thẻ RFID tại khu vực H',
      description: 'Khu vực cây dược liệu',
      baseTemperature: 27.0,
      baseHumidity: 66.5,
      createdAt: '2024-08-14 16:25:00',
      updatedAt: '2024-10-27 12:55:40'
    },
    {
      id: 9,
      uid: 'G3H4I5J6',
      location: 'Thẻ RFID tại khu vực I',
      description: 'Khu vực cây cảnh',
      baseTemperature: 25.0,
      baseHumidity: 69.0,
      createdAt: '2024-09-20 17:40:00',
      updatedAt: '2024-10-28 07:30:50'
    },
    {
      id: 10,
      uid: 'K7L8M9N0',
      location: 'Thẻ RFID tại khu vực J',
      description: 'Khu vực nghiên cứu',
      baseTemperature: 24.5,
      baseHumidity: 71.5,
      createdAt: '2024-10-01 18:55:00',
      updatedAt: '2024-10-28 13:10:05'
    }
  ]);

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
            <input id="location" class="form-control" placeholder="Thẻ RFID tại khu vực...">
          </div>
          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea id="description" class="form-control" rows="2" placeholder="Nhập mô tả"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Mốc nhiệt độ gốc (°C)</label>
            <input id="baseTemperature" type="number" step="0.1" class="form-control" placeholder="25.0">
          </div>
          <div class="mb-3">
            <label class="form-label">Mốc độ ẩm gốc (%)</label>
            <input id="baseHumidity" type="number" step="0.1" class="form-control" placeholder="70.0">
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
        const uid = (document.getElementById('uid') as HTMLInputElement).value;
        const location = (document.getElementById('location') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const baseTemperature = parseFloat((document.getElementById('baseTemperature') as HTMLInputElement).value);
        const baseHumidity = parseFloat((document.getElementById('baseHumidity') as HTMLInputElement).value);

        if (!uid || !location || !description || isNaN(baseTemperature) || isNaN(baseHumidity)) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
          return false;
        }

        return { uid, location, description, baseTemperature, baseHumidity };
      }
    });

    if (formValues) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const newCard: RFIDCard = {
        id: Math.max(...cards.map(c => c.id)) + 1,
        ...formValues,
        createdAt: now,
        updatedAt: now
      };
      setCards([...cards, newCard]);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm thẻ RFID mới',
        confirmButtonColor: '#3498db'
      });
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
            <input id="location" class="form-control" value="${card.location}">
          </div>
          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea id="description" class="form-control" rows="2">${card.description}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Mốc nhiệt độ gốc (°C)</label>
            <input id="baseTemperature" type="number" step="0.1" class="form-control" value="${card.baseTemperature}">
          </div>
          <div class="mb-3">
            <label class="form-label">Mốc độ ẩm gốc (%)</label>
            <input id="baseHumidity" type="number" step="0.1" class="form-control" value="${card.baseHumidity}">
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
        const uid = (document.getElementById('uid') as HTMLInputElement).value;
        const location = (document.getElementById('location') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const baseTemperature = parseFloat((document.getElementById('baseTemperature') as HTMLInputElement).value);
        const baseHumidity = parseFloat((document.getElementById('baseHumidity') as HTMLInputElement).value);

        if (!uid || !location || !description || isNaN(baseTemperature) || isNaN(baseHumidity)) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
          return false;
        }

        return { uid, location, description, baseTemperature, baseHumidity };
      }
    });

    if (formValues) {
      const updatedCards = cards.map(c => 
        c.id === card.id 
          ? { ...c, ...formValues, updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : c
      );
      setCards(updatedCards);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã cập nhật thông tin thẻ RFID',
        confirmButtonColor: '#3498db'
      });
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
      setCards(cards.filter(c => c.id !== card.id));
      
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa!',
        text: 'Thẻ RFID đã được xóa thành công',
        confirmButtonColor: '#3498db'
      });
    }
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
                  <th>UID</th>
                  <th>Vị trí</th>
                  <th>Mô tả</th>
                  <th>Nhiệt độ gốc (°C)</th>
                  <th>Độ ẩm gốc (%)</th>
                  <th>Thời gian tạo</th>
                  <th>Thời gian cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td className="fw-semibold">{card.uid}</td>
                    <td>{card.location}</td>
                    <td>{card.description}</td>
                    <td className="text-center">{card.baseTemperature.toFixed(1)}</td>
                    <td className="text-center">{card.baseHumidity.toFixed(1)}</td>
                    <td className="text-muted small">{formatDateTime(card.createdAt)}</td>
                    <td className="text-muted small">{formatDateTime(card.updatedAt)}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}