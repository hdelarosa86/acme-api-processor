const grabCompanies = () =>
  new Promise((res, rej) => {
    // can change url to /api/products, /api/offerings for the other ones
    return window
      .fetch('https://acme-users-api-rev.herokuapp.com/api/companies')
      .then(response => response.json())
      .then(jsonData => res(jsonData))
      .catch(e => rej(e));
  });
const grabProducts = () =>
  new Promise((res, rej) => {
    // can change url to /api/products, /api/offerings for the other ones
    return window
      .fetch('https://acme-users-api-rev.herokuapp.com/api/products')
      .then(response => response.json())
      .then(jsonData => res(jsonData))
      .catch(e => rej(e));
  });
const grabOfferings = () =>
  new Promise((res, rej) => {
    // can change url to /api/products, /api/offerings for the other ones
    return window
      .fetch('https://acme-users-api-rev.herokuapp.com/api/offerings')
      .then(response => response.json())
      .then(jsonData => res(jsonData))
      .catch(e => rej(e));
  });

Promise.all([grabCompanies(), grabProducts(), grabOfferings()]).then(
  responses => {
    const [companies, products, offerings] = responses;
    const productsInPriceRange = findProductsInPriceRange(products, {
      min: 1,
      max: 15,
    });
    //console.log(productsInPriceRange);

    const groupedCompaniesByLetter = groupCompaniesByLetter(companies);
    //console.log(groupedCompaniesByLetter);
    const groupedCompaniesByState = groupCompaniesByState(companies);
    //console.log(groupedCompaniesByState);
    const processedOfferings = processOfferings({
      companies,
      products,
      offerings,
    });
    //console.log(processedOfferings);
    const threeOrMoreOfferings = companiesByNumberOfOfferings(
      companies,
      offerings,
      3
    );
    //console.log(threeOrMoreOfferings);
    const processedProducts = processProducts({ products, offerings });
    console.log(processedProducts);
  } // End of responses
);

//Functions

const findProductsInPriceRange = (products, priceRange) => {
  const minPrice = priceRange.min;
  const maxPrice = priceRange.max;
  return products.filter(product => {
    if (
      product.suggestedPrice >= minPrice &&
      product.suggestedPrice <= maxPrice
    ) {
      return product;
    }
  });
};

const groupCompaniesByLetter = companies => {
  return companies.reduce((tally, company) => {
    if (tally[company.name[0]]) {
      tally[company.name[0]].push(company);
    } else {
      tally[company.name[0]] = [company];
    }
    return tally;
  }, {});
};

const groupCompaniesByState = companies => {
  return companies.reduce((tally, company) => {
    if (tally[company.state]) {
      tally[company.state].push(company);
    } else {
      tally[company.state] = [company];
    }
    return tally;
  }, {});
};

const processOfferings = obj => {
  const companies = obj.companies;
  const products = obj.products;
  const offerings = obj.offerings;
  return offerings.map(offering => {
    const compName = companies.filter(company => {
      return offering.companyId === company.id;
    })[0].name;

    const prodName = products.filter(product => {
      return offering.productId === product.id;
    })[0].name;

    return { id: offering.id, product: prodName, company: compName };
  });
};

const companiesByNumberOfOfferings = (companies, offerings, n) => {
  const tallyOfOfferings = offerings.reduce((tally, offering) => {
    if (tally[offering.companyId]) {
      tally[offering.companyId] = tally[offering.companyId] + 1;
    } else {
      tally[offering.companyId] = 1;
    }
    return tally;
  }, {});

  return companies.reduce((arr, currVal) => {
    if (tallyOfOfferings[currVal.id] >= 3) {
      arr.push(currVal.name);
    }
    return arr;
  }, []);
};

const processProducts = obj => {
  const products = obj.products;
  const offerings = obj.offerings;
  return products.map(product => {
    let name = product.name;
    let n = 0;
    let average =
      offerings.reduce((accum, offer) => {
        if (offer.productId === product.id) {
          accum += offer.price;
          n++;
        }
        return accum;
      }, 0) / n;
    return { name: name, average: Number(average.toFixed(2)) };
  });
};
