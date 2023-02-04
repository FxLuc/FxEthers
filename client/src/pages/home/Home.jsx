import { useEffect, useState } from 'react'
// import { useEth } from '../../contexts'
import { usePageTitle } from '../../hooks'
// import { BUTTON_STATE, REGEX_NUMBER } from '../../utils'
// import { isAddress, parseUnits, formatUnits } from 'ethers/lib/utils'
// import { ButtonSubmit, Footer } from '../../components'
import ItemCard from './ItemCard'
import { getItems } from '../../api'

function Home(props) {
  const { pageTitle } = props
  usePageTitle(pageTitle)

  const [itemList, setItemList] = useState([])

  useEffect(() => {
    const getItemList = async () => {
      try {
        const items = await getItems()
        setItemList(items.data)
      } catch (error) { }
    }
    getItemList()
    return () => setItemList([])
  }, [])

  return (
    <>
      <h4>Newest</h4>
      <div className='py-3 row '>
        {itemList.map(item => <ItemCard item={item} key={item._id} />)}
      </div>
    </>
  )
}

export { Home }
