import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, BarChart3 } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

export default function QuickActions() {
  return (
    <Card>
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">Quick actions</h2>
      <div className="space-y-2">
        <Link to="/pos" className="block">
          <Button className="w-full justify-start">
            <ShoppingCart className="w-4 h-4 mr-2" /> New sale
          </Button>
        </Link>
        <Link to="/products" className="block">
          <Button variant="secondary" className="w-full justify-start">
            <Plus className="w-4 h-4 mr-2" /> Add product
          </Button>
        </Link>
        <Link to="/reports" className="block">
          <Button variant="secondary" className="w-full justify-start">
            <BarChart3 className="w-4 h-4 mr-2" /> View reports
          </Button>
        </Link>
      </div>
    </Card>
  );
}