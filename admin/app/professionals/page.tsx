'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Professional } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface ProfessionalFormData {
    name: string;
    phone: string;
    email: string;
    specialty: string;
}

export default function ProfessionalsPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
    const [formData, setFormData] = useState<ProfessionalFormData>({
        name: '',
        phone: '',
        email: '',
        specialty: 'Salon'
    });

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            const response = await adminAPI.getProfessionals();
            setProfessionals(response.data.professionals);
        } catch (error) {
            console.error('Error fetching professionals:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            await adminAPI.updateProfessional(id, { isAvailable: !currentStatus });
            fetchProfessionals();
        } catch (error) {
            console.error('Error updating professional:', error);
            alert('Failed to update availability');
        }
    };

    const handleOpenModal = (professional?: Professional) => {
        if (professional) {
            setEditingProfessional(professional);
            setFormData({
                name: professional.name,
                phone: professional.phone || '',
                email: professional.email || '',
                specialty: professional.specialty
            });
        } else {
            setEditingProfessional(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                specialty: 'Salon'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProfessional(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            specialty: 'Salon'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingProfessional) {
                await adminAPI.updateProfessional(editingProfessional.id, formData);
            } else {
                await adminAPI.createProfessional(formData);
            }
            fetchProfessionals();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving professional:', error);
            alert('Failed to save professional');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }

        try {
            await adminAPI.deleteProfessional(id);
            fetchProfessionals();
        } catch (error) {
            console.error('Error deleting professional:', error);
            alert('Failed to delete professional');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Professionals</h1>
                        <p className="text-gray-600 mt-2">Manage service professionals</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Professional
                    </button>
                </div>

                {/* Professionals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center text-gray-600 py-12">
                            Loading...
                        </div>
                    ) : professionals.length === 0 ? (
                        <div className="col-span-full text-center text-gray-600 py-12">
                            No professionals found. Click "Add Professional" to create one.
                        </div>
                    ) : (
                        professionals.map((professional) => (
                            <div key={professional.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                                        <p className="text-sm text-gray-600">{professional.specialty}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(professional)}
                                            className="text-gray-600 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(professional.id, professional.name)}
                                            className="text-gray-600 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="text-gray-900">{professional.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="text-gray-900 truncate">{professional.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Rating:</span>
                                        <span className="text-yellow-600 font-semibold">⭐ {professional.rating}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => toggleAvailability(professional.id, professional.isAvailable)}
                                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${professional.isAvailable
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {professional.isAvailable ? '✓ Available' : '✗ Unavailable'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProfessional ? 'Edit Professional' : 'Add New Professional'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialty *
                                </label>
                                <select
                                    required
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Salon">Salon</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Painting">Painting</option>
                                    <option value="AC Repair">AC Repair</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingProfessional ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
