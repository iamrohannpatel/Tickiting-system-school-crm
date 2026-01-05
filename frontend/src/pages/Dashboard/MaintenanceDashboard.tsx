import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useTickets, Ticket } from "../../context/TicketContext";
import { Link } from "react-router";
import TicketTable, { ColumnDef } from "../../components/tickets/TicketTable";
import StatusBadge from "../../components/tickets/StatusBadge";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";

const MaintenanceDashboard: React.FC = () => {
    const { tickets, updateTicket, loading } = useTickets();
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // Assignment Modal State
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");

    const maintenanceEmployees = [
        "Mr. Mike Builder (Head)",
        "John Fixer",
        "Sarah Electrician",
        "Bob Plumber",
        "Alice Painter"
    ];

    // Filter tickets logic
    const maintenanceTickets = tickets.filter(ticket =>
        ['Approved', 'Assigned', 'In Progress', 'Completed', 'Closed'].includes(ticket.status)
    );

    const filteredTickets = statusFilter === "All"
        ? maintenanceTickets
        : maintenanceTickets.filter(ticket => ticket.status === statusFilter);

    // Completion Modal State
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [completionFile, setCompletionFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Handlers
    const openAssignModal = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setSelectedEmployee(maintenanceEmployees[0]); // Default
        openModal();
    };

    const confirmAssignment = () => {
        if (selectedTicket && selectedEmployee) {
            updateTicket(selectedTicket.id, {
                status: 'Assigned',
                assignedTo: selectedEmployee
            });
            toast.success(`Ticket assigned to ${selectedEmployee}`);
            closeModal();
            setSelectedTicket(null);
        }
    };

    const handleStatusUpdate = (ticket: Ticket, newStatus: Ticket['status']) => {
        updateTicket(ticket.id, { status: newStatus });
        toast.success(`Ticket status updated to ${newStatus}`);
    };

    const handleCompleteClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setCompletionFile(null);
        setPreviewUrl(null);
        setIsCompletionModalOpen(true);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCompletionFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const confirmCompletion = () => {
        if (selectedTicket && completionFile) {
            // Simulate upload by using the object URL
            // In a real app, you would upload 'completionFile' to a server here
            const proofImageUrl = previewUrl || "";

            updateTicket(selectedTicket.id, {
                status: 'Completed',
                proofImage: proofImageUrl
            });
            toast.success(`Ticket completed with proof!`);
            setIsCompletionModalOpen(false);
            setSelectedTicket(null);
            setCompletionFile(null);
            setPreviewUrl(null);
        } else {
            toast.error("Please upload a proof image/video first.");
        }
    };

    const columns: ColumnDef[] = [
        {
            header: "ID",
            cell: (ticket) => <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{ticket.id}</span>
        },
        {
            header: "Issue",
            cell: (ticket) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{ticket.issue}</span>
                    <span className="text-xs text-gray-400">{ticket.category}</span>
                </div>
            )
        },
        {
            header: "Assigned To",
            cell: (ticket) => (
                <span className="text-theme-sm text-gray-600 dark:text-gray-400">
                    {ticket.assignedTo || "-"}
                </span>
            )
        },
        {
            header: "Status",
            cell: (ticket) => <StatusBadge status={ticket.status} size="sm" />
        },
        {
            header: "Actions",
            cell: (ticket) => (
                <div className="flex items-center gap-2">
                    {ticket.status === 'Approved' && (
                        <Button size="sm" onClick={() => openAssignModal(ticket)} className="bg-brand-500 hover:bg-brand-600 text-white">
                            Assign
                        </Button>
                    )}
                    {ticket.status === 'Assigned' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(ticket, 'In Progress')} className="bg-blue-500 hover:bg-blue-600 text-white">
                            Start Work
                        </Button>
                    )}
                    {ticket.status === 'In Progress' && (
                        <Button size="sm" onClick={() => handleCompleteClick(ticket)} className="bg-success-600 hover:bg-success-700 text-white">
                            Complete
                        </Button>
                    )}
                    <Link to={`/maintenance/ticket/${ticket.id}`} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                        View
                    </Link>
                </div>
            )
        }
    ];

    return (
        <>
            <PageMeta
                title="Maintenance Dashboard | Maintenance Ticketing System"
                description="Maintenance dashboard for managing assigned tickets."
            />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Maintenance Dashboard</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage tickets assigned to the maintenance department.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Task List ({filteredTickets.length})
                        </h3>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-transparent py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-gray-300 dark:focus:border-brand-500"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Approved">New (Approved)</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </span>
                        </div>
                    </div>

                    <TicketTable tickets={filteredTickets} columns={columns} loading={loading} />
                </div>
            </div>

            {/* Assignment Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] p-6">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Assign Ticket
                    </h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Maintenance Employee
                        </label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            {maintenanceEmployees.map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex w-full gap-3 mt-4">
                        <Button variant="outline" onClick={closeModal} className="w-full justify-center">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={confirmAssignment}
                            className="w-full justify-center bg-brand-600 hover:bg-brand-700"
                        >
                            Confirm Assignment
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Completion Modal */}
            <Modal isOpen={isCompletionModalOpen} onClose={() => setIsCompletionModalOpen(false)} className="max-w-[400px] p-6">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Task & Upload Proof
                    </h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upload Proof (Image/Video)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {previewUrl && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                            <img src={previewUrl} alt="Proof Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                        </div>
                    )}

                    <div className="flex w-full gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsCompletionModalOpen(false)} className="w-full justify-center">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={confirmCompletion}
                            disabled={!completionFile}
                            className={`w-full justify-center ${completionFile ? 'bg-success-600 hover:bg-success-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            Submit Proof
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default MaintenanceDashboard;
