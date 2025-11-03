'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Swal from 'sweetalert2';
import React from 'react';

interface RFIDTag {
    id: number;
    uid: string;
    location_name: string;
    description: string;
    reference_temperature: number;
    reference_humidity: number;
    measurement_frequency: number;
}

interface WorkPlanItem {
    id: number;
    work_plan_id: number;
    rfid_tag_id: number;
    rfidTag: RFIDTag;
    measurement_frequency: number;
}

interface WorkPlan {
    id: number;
    description: string;
    status: string;
    progress: string;
    temp_threshold: number;
    hum_threshold: number;
    violation_count: number;
    items: WorkPlanItem[];
    created_at: string;
    updated_at: string;
}

export default function WorkPlanPage() {
    const [plans, setPlans] = useState<WorkPlan[]>([]);
    const [rfidTags, setRfidTags] = useState<RFIDTag[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const limit = 15;

    // Fetch work plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${apiUrl}/work-plans?page=${currentPage}&limit=${limit}`);
                if (!res.ok) throw new Error();
                const json = await res.json();
                setPlans(json.data || []);
                setTotalPages(json.totalPages || 1);
            } catch (err) {
                console.error('Lỗi fetch work plans:', err);
                setPlans([]);
                setTotalPages(1);
            }
        };
        fetchPlans();
    }, [currentPage, apiUrl, refreshTrigger]);

    // Fetch RFID tags (cho modal)
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch(`${apiUrl}/rfid-tags`);
                if (!res.ok) throw new Error();
                const json = await res.json();
                setRfidTags(json.data || []);
            } catch (err) {
                console.error('Lỗi fetch RFID tags:', err);
                setRfidTags([]);
            }
        };
        fetchTags();
    }, [apiUrl]);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

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
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    const toggleExpandPlan = (planId: number) => {
        setExpandedPlanId(prev => (prev === planId ? null : planId));
    };

    const handleCreatePlan = async (templatePlan?: WorkPlan) => {
        let itemIndex = templatePlan?.items.length || 1;

        const { value: formValues } = await Swal.fire({
            title: templatePlan ? 'Áp dụng lại kế hoạch' : 'Tạo kế hoạch mới',
            html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">Tiêu đề</label>
            <input id="description" class="form-control" 
              value="${templatePlan?.description || ''}" 
              placeholder="Nhập tiêu đề kế hoạch">
          </div>
          
          <div class="mb-3">
            <label class="form-label">Danh sách vị trí đo</label>
            <div id="items-container">
              ${templatePlan?.items.map((item, idx) => `
                <div class="item-row mb-3 p-3" style="background: #f8f9fa; border-radius: 6px;" data-index="${idx}">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>Vị trí ${idx + 1}</strong>
                    <button развитию type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${idx}">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="form-label small">Thẻ RFID</label>
                      <select class="form-select form-select-sm rfid-select" data-index="${idx}">
                        ${rfidTags.map(tag => `
                          <option value="${tag.id}" ${tag.id === item.rfid_tag_id ? 'selected' : ''}>
                            ${tag.uid} - ${tag.location_name}
                          </option>
                        `).join('')}
                      </select>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="form-label small">Tần suất đo (lần)</label>
                      <input type="number" class="form-control form-control-sm frequency-input" 
                        data-index="${idx}" value="${item.measurement_frequency}" min="1">
                    </div>
                  </div>
                </div>
              `).join('') || `
                <div class="item-row mb-3 p-3" style="background: #f8f9fa; border-radius: 6px;" data-index="0">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>Vị trí 1</strong>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="0">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <!-- Thẻ RFID -->
                      <label class="form-label small">Thẻ RFID</label>
                      <select class="form-select form-select-sm rfid-select" data-index="0">
                        ${rfidTags.map(tag => `<option value="${tag.id}">${tag.uid} - ${tag.location_name}</option>`).join('')}
                      </select>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="form-label small">Tần suất đo (lần)</label>
                      <input type="number" class="form-control form-control-sm frequency-input" 
                        data-index="0" value="1" min="1">
                    </div>
                  </div>
                </div>
              `}
            </div>
            <button type="button" id="add-item-btn" class="btn btn-sm btn-outline-primary mt-2">
              <i class="fas fa-plus me-1"></i> Thêm vị trí
            </button>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Mức chênh nhiệt độ (°C)</label>
              <input id="temp_threshold" type="number" step="0.1" class="form-control" 
                value="${templatePlan?.temp_threshold || ''}" placeholder="3.0">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Mức chênh độ ẩm (%)</label>
              <input id="hum_threshold" type="number" step="0.1" class="form-control" 
                value="${templatePlan?.hum_threshold || ''}" placeholder="8.0">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Số lần vi phạm cho phép</label>
              <input id="violation_count" type="number" class="form-control" 
                value="${templatePlan?.violation_count || ''}" placeholder="2">
            </div>
          </div>
        </div>
      `,
            width: '800px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#95a5a6',
            didOpen: () => {
                const addBtn = document.getElementById('add-item-btn');
                const container = document.getElementById('items-container');

                addBtn?.addEventListener('click', () => {
                    const newItem = document.createElement('div');
                    newItem.className = 'item-row mb-3 p-3';
                    newItem.style.cssText = 'background: #f8f9fa; border-radius: 6px;';
                    newItem.dataset.index = String(itemIndex);
                    newItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Vị trí ${itemIndex + 1}</strong>
              <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${itemIndex}">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="row">
              <div class="col-md-6 mb-2">
                <label class="form-label small">Thẻ RFID</label>
                <select class="form-select form-select-sm rfid-select" data-index="${itemIndex}">
                  ${rfidTags.map(tag => `<option value="${tag.id}">${tag.uid} - ${tag.location_name}</option>`).join('')}
                </select>
              </div>
              <div class="col-md-6 mb-2">
                <label class="form-label small">Tần suất đo (lần)</label>
                <input type="number" class="form-control form-control-sm frequency-input" 
                  data-index="${itemIndex}" value="1" min="1">
              </div>
            </div>
          `;
                    container?.appendChild(newItem);
                    itemIndex++;
                    attachRemoveListeners();
                });

                const attachRemoveListeners = () => {
                    document.querySelectorAll('.remove-item-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const target = e.currentTarget as HTMLElement;
                            const index = target.dataset.index;
                            const row = document.querySelector(`.item-row[data-index="${index}"]`);
                            if (container && container.children.length > 1) {
                                row?.remove();
                            } else {
                                Swal.showValidationMessage('Phải có ít nhất 1 vị trí đo');
                            }
                        });
                    });
                };

                attachRemoveListeners();
            },
            preConfirm: () => {
                const description = (document.getElementById('description') as HTMLInputElement).value.trim();
                const temp_threshold = parseFloat((document.getElementById('temp_threshold') as HTMLInputElement).value);
                const hum_threshold = parseFloat((document.getElementById('hum_threshold') as HTMLInputElement).value);
                const violation_count = parseInt((document.getElementById('violation_count') as HTMLInputElement).value);

                const items: { rfid_tag_id: number; measurement_frequency: number }[] = [];
                document.querySelectorAll('.item-row').forEach(row => {
                    const index = row.getAttribute('data-index');
                    const select = row.querySelector(`.rfid-select[data-index="${index}"]`) as HTMLSelectElement;
                    const input = row.querySelector(`.frequency-input[data-index="${index}"]`) as HTMLInputElement;
                    if (select && input && select.value && input.value) {
                        items.push({
                            rfid_tag_id: parseInt(select.value),
                            measurement_frequency: parseInt(input.value)
                        });
                    }
                });

                if (!description) return Swal.showValidationMessage('Vui lòng nhập tiêu đề');
                if (isNaN(temp_threshold) || isNaN(hum_threshold) || isNaN(violation_count))
                    return Swal.showValidationMessage('Vui lòng nhập đầy đủ ngưỡng');
                if (items.length === 0) return Swal.showValidationMessage('Phải có ít nhất 1 vị trí đo');

                return { description, items, temp_threshold, hum_threshold, violation_count };
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${apiUrl}/work-plans`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });

                if (!res.ok) throw new Error();

                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đã tạo kế hoạch mới',
                    confirmButtonColor: '#3498db'
                });

                triggerRefresh();
                setCurrentPage(1);
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Tạo kế hoạch thất bại',
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    };

    const handleDeletePlan = async (planId: number, planDescription: string) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có chắc muốn xóa kế hoạch "${planDescription}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${apiUrl}/work-plans/${planId}`, {
                    method: 'DELETE',
                });

                if (!res.ok) throw new Error();

                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Kế hoạch đã được xóa thành công.',
                    confirmButtonColor: '#3498db',
                });

                triggerRefresh(); // Refresh danh sách
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Xóa kế hoạch thất bại. Vui lòng thử lại.',
                    confirmButtonColor: '#e74c3c',
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
                    <i className="fas fa-tasks me-3"></i>
                    Kế hoạch làm việc
                </h2>
            </div>

            <div className="mt-4">
                <div className="mb-3">
                    <button className="btn btn-primary" onClick={() => handleCreatePlan()}>
                        <i className="fas fa-plus me-2"></i>
                        Tạo kế hoạch mới
                    </button>
                </div>

                <div className="data-card">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{ width: '80px' }}>STT</th>
                                    <th style={{ width: '40px' }}></th>
                                    <th>Tiêu đề</th>
                                    <th>Trạng thái</th>
                                    <th>Tiến độ</th>
                                    <th>Mức chênh nhiệt độ</th>
                                    <th>Mức chênh độ ẩm</th>
                                    <th>Số lần vi phạm cho phép</th>
                                    <th>Thời gian tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan, index) => {
                                    const isExpanded = expandedPlanId === plan.id;

                                    return (
                                        <React.Fragment key={plan.id}>
                                            <tr>
                                                <td className="text-center fw-semibold">
                                                    {index + 1 + (currentPage - 1) * limit}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-link p-0"
                                                        onClick={() => toggleExpandPlan(plan.id)}
                                                    >
                                                        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                                                    </button>
                                                </td>
                                                <td className="fw-semibold">{plan.description}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(plan.status)}`}>
                                                        {getStatusText(plan.status)}
                                                    </span>
                                                </td>
                                                <td>{parseFloat(plan.progress).toFixed(2)}%</td>
                                                <td className="text-center">{plan.temp_threshold.toFixed(1)}°C</td>
                                                <td className="text-center">{plan.hum_threshold.toFixed(1)}%</td>
                                                <td className="text-center">{plan.violation_count}</td>
                                                <td className='text-center'>{formatDateTime(plan.created_at)}</td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleCreatePlan(plan)}
                                                            title="Áp dụng lại"
                                                        >
                                                            <i className="fas fa-redo"></i>
                                                        </button>

                                                        <button
                                                            className={`btn btn-sm btn-outline-danger ms-1 ${['COMPLETED', 'NOT_RECEIVED', 'FAILED'].includes(plan.status)
                                                                    ? ''
                                                                    : 'invisible'
                                                                }`}
                                                            onClick={() => handleDeletePlan(plan.id, plan.description)}
                                                            title="Xóa kế hoạch"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={10} className="bg-light p-0">
                                                        <div className="p-3">
                                                            <h6 className="mb-3">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                Chi tiết vị trí đo ({plan.items.length} vị trí)
                                                            </h6>
                                                            <div className="row g-3">
                                                                {plan.items.map((item) => (
                                                                    <div key={item.id} className="col-md-6">
                                                                        <div className="card">
                                                                            <div className="card-body">
                                                                                <h6 className="card-title text-primary">
                                                                                    <i className="fas fa-id-card me-2"></i>
                                                                                    {item.rfidTag.uid} - {item.rfidTag.location_name}
                                                                                </h6>
                                                                                <p className="text-muted small mb-2">{item.rfidTag.description}</p>
                                                                                <div className="row">
                                                                                    <div className="col-6">
                                                                                        <small className="text-muted d-block">Tần suất đo</small>
                                                                                        <strong>{item.measurement_frequency} lần</strong>
                                                                                    </div>
                                                                                    <div className="col-6">
                                                                                        <small className="text-muted d-block">Chuẩn</small>
                                                                                        <strong>{item.rfidTag.reference_temperature}°C / {item.rfidTag.reference_humidity}%</strong>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
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