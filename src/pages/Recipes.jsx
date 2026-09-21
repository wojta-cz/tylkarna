import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { RECIPE_CATEGORIES } from '../data/seed'

export default function Recipes() {
  const { db } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState(null)

  if (!db) return null

  const filtered = useMemo(() => {
    return db.recipes.filter((r) => {
      const matchesCat = category === 'all' || r.category === category
      const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase())
      return matchesCat && matchesQuery
    })
  }, [db.recipes, query, category])

  const open = db.recipes.find((r) => r.id === openId)

  if (open) {
    const cat = RECIPE_CATEGORIES[open.category]
    return (
      <div className="max-w-2xl mx-auto pb-6">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-1.5 text-accent text-sm font-medium mb-5">
          <ArrowLeft size={16} /> Recepty
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{cat.emoji}</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cat.label}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{open.title}</h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Ingredience</h3>
          <table className="w-full text-sm">
            <tbody>
              {open.ingredients.map((ing, i) => (
                <tr key={i} className="border-t border-gray-100 first:border-0">
                  <td className="py-1.5 text-gray-700">{ing.name}</td>
                  <td className="py-1.5 text-right text-gray-500">{ing.qty} {ing.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Postup</h3>
          <ol className="flex flex-col gap-2.5">
            {open.preparation.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-800">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {open.notes && (
          <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 text-sm">💡 {open.notes}</div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">☕ Recepty</h1>
      <p className="text-sm text-gray-500 mb-4">Interní přehled receptů.</p>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat recepty…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-200"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('all')}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
            category === 'all' ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          Vše
        </button>
        {Object.entries(RECIPE_CATEGORIES).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
              category === key ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const cat = RECIPE_CATEGORIES[r.category]
          return (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="bg-white border border-gray-200 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:border-accent-200 transition-all"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <h3 className="font-semibold text-gray-900 mt-3">{r.title}</h3>
              <span className="inline-block mt-3 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.label}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && <p className="text-sm text-gray-400">Žádný recept neodpovídá hledání.</p>}
      </div>
    </div>
  )
}
